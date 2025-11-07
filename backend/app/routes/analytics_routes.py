from flask import Blueprint, jsonify
from app.extensions import mongo
from datetime import datetime, timedelta
from collections import defaultdict

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/washroom-status', methods=['GET'])
def get_washroom_status():
    """
    Get washroom status based on recent reports.
    Status is determined by:
    - 'good': No issues in last 24 hours
    - 'maintenance': Has issues but not critical
    - 'issue': Has active critical issues
    """
    try:
        # Get all locations from reports
        reports = list(mongo.db.reports.find())
        
        # Get unique locations
        locations = set()
        for report in reports:
            if report.get('location'):
                locations.add(report['location'])
        
        # Default locations if no reports exist
        default_locations = [
            "Restroom - Ground Floor(010)",
            "Restroom - First Floor(110)",
            "Restroom - Second Floor(210)",
            "Restroom - Third Floor(310)",
            "Restroom - Fourth Floor(410)",
            "Restroom - Fifth Floor(510)",
            "Restroom - Sixth Floor(610)",
        ]
        
        # Use default locations if no reports
        if not locations:
            locations = set(default_locations)
        
        # Check resolved locations
        resolved_reports = list(mongo.db.admin_updates.find())
        resolved_location_ids = set()
        for update in resolved_reports:
            if update.get('reportId'):
                resolved_location_ids.add(str(update.get('reportId')))
        
        # Calculate status for each location
        washroom_status = []
        now = datetime.utcnow()
        one_day_ago = now - timedelta(days=1)
        
        for location in locations:
            # Get recent reports for this location (last 24 hours)
            recent_reports = [
                r for r in reports 
                if r.get('location') == location 
                and r.get('timestamp')
            ]
            
            # Filter by timestamp if available
            active_reports = []
            for report in recent_reports:
                report_id = str(report.get('_id'))
                # Check if not resolved
                if report_id in resolved_location_ids:
                    continue
                    
                report_time = report.get('timestamp')
                parsed_time = None
                
                if isinstance(report_time, dict) and '$date' in report_time:
                    # MongoDB date format
                    if isinstance(report_time['$date'], (int, float)):
                        parsed_time = datetime.fromtimestamp(report_time['$date'] / 1000)
                    else:
                        parsed_time = report_time['$date']
                elif isinstance(report_time, str):
                    try:
                        # Try ISO format
                        parsed_time = datetime.fromisoformat(report_time.replace('Z', '+00:00'))
                    except:
                        try:
                            # Try other common formats
                            parsed_time = datetime.strptime(report_time, '%Y-%m-%dT%H:%M:%S.%f')
                        except:
                            parsed_time = None
                elif isinstance(report_time, datetime):
                    parsed_time = report_time
                
                # Include report if timestamp is recent or if timestamp parsing failed (to be safe)
                if parsed_time is None or parsed_time >= one_day_ago:
                    active_reports.append(report)
            
            # Determine status
            if not active_reports:
                status = "good"
                last_updated = "No recent issues"
            else:
                # Check priority levels
                high_priority_count = sum(1 for r in active_reports if r.get('priority', '').upper() in ['HIGH', 'HIGH PRIORITY'])
                if high_priority_count > 0:
                    status = "issue"
                else:
                    status = "maintenance"
                
                # Get most recent report time
                def parse_timestamp(ts):
                    if isinstance(ts, dict) and '$date' in ts:
                        if isinstance(ts['$date'], (int, float)):
                            return datetime.fromtimestamp(ts['$date'] / 1000)
                        return ts['$date']
                    elif isinstance(ts, str):
                        try:
                            return datetime.fromisoformat(ts.replace('Z', '+00:00'))
                        except:
                            try:
                                return datetime.strptime(ts, '%Y-%m-%dT%H:%M:%S.%f')
                            except:
                                return datetime.min
                    elif isinstance(ts, datetime):
                        return ts
                    return datetime.min
                
                latest_report = max(active_reports, key=lambda x: parse_timestamp(x.get('timestamp')))
                report_time = parse_timestamp(latest_report.get('timestamp'))
                if report_time == datetime.min:
                    report_time = now
                
                # Calculate time ago
                time_diff = now - report_time
                if time_diff.total_seconds() < 3600:  # Less than 1 hour
                    minutes = int(time_diff.total_seconds() / 60)
                    last_updated = f"{minutes} mins ago" if minutes > 0 else "Just now"
                elif time_diff.total_seconds() < 86400:  # Less than 24 hours
                    hours = int(time_diff.total_seconds() / 3600)
                    last_updated = f"{hours} hour{'s' if hours > 1 else ''} ago"
                else:
                    days = int(time_diff.total_seconds() / 86400)
                    last_updated = f"{days} day{'s' if days > 1 else ''} ago"
            
            washroom_status.append({
                "name": location,
                "status": status,
                "lastUpdated": last_updated
            })
        
        return jsonify(washroom_status), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@analytics_bp.route('/api/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Get heatmap data grouped by location and issue category.
    Returns data in format suitable for heatmap visualization.
    """
    try:
        reports = list(mongo.db.reports.find())
        
        # Group by location and category
        heatmap_data = defaultdict(lambda: defaultdict(int))
        
        # Get resolved reports to exclude
        resolved_reports = list(mongo.db.admin_updates.find())
        resolved_report_ids = {str(update.get('reportId')) for update in resolved_reports if update.get('reportId')}
        
        for report in reports:
            report_id = str(report.get('_id'))
            # Skip resolved reports
            if report_id in resolved_report_ids:
                continue
            
            location = report.get('location', 'Unknown')
            category = report.get('issueType', 'Other')
            
            # Normalize category names
            category = category.strip()
            
            heatmap_data[location][category] += 1
        
        # Convert to list format
        result = []
        for location, categories in heatmap_data.items():
            for category, count in categories.items():
                result.append({
                    "location": location,
                    "category": category,
                    "count": count
                })
        
        # Also return summary by location
        location_summary = {}
        for location, categories in heatmap_data.items():
            total = sum(categories.values())
            location_summary[location] = {
                "total": total,
                "categories": dict(categories)
            }
        
        return jsonify({
            "data": result,
            "summary": location_summary
        }), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

