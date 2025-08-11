# F3 AdminLTE - Custom Reporting Dashboard

A PHP-based web application built with the Fat-Free Framework (F3) and AdminLTE template, featuring a custom reporting module with interactive data tables.

## Features

- **Custom Reporting Module**: Interactive reports with filtering by report type, customer, and period
- **DataTables Integration**: Sortable, searchable, and paginated data tables
- **Responsive Design**: Mobile-friendly interface using AdminLTE
- **RESTful API**: Clean API endpoints for data retrieval
- **Real-time Filtering**: Dynamic data updates based on user selections

## Installation & Setup

### Prerequisites
- PHP 7.4 or higher
- Composer
- Web server (Apache/Nginx) or PHP built-in server
- MySQL/MariaDB (for production)

### 1. Clone the Repository
```bash
git clone https://github.com/rzqdevgod/fuzeMobi-f3-adminlte.git
cd fuzeMobi-f3-adminlte
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Database Setup
```bash
# Import the database schema
mysql -u your_username -p your_database < appdb.sql
```

### 4. Configuration
Edit `config/config.ini` with your database credentials:
```ini
[database]
host = localhost
port = 3306
name = your_database_name
user = your_username
pass = your_password
```

### 5. Start Development Server
```bash
# Using Composer
composer run

# Or using PHP built-in server
php -S localhost:8000
```

### 6. Access the Application
Open your browser and navigate to:
- **Main Application**: `http://localhost:8000`
    - Use the following credential for the test
        - email: test@test.com
        - password: 123
- **Reports Module**: `http://localhost:8000/dashboard`

## Reporting Module

The custom reporting module includes:

### Available Reports
- Data Usage by Network
- Data Management by IMSI
- Invoice Detail - Data
- Invoice Detail - SMS
- SIM List
- Administrator Logging Report

### Filtering Options
- **Report Type**: Select from available report types
- **Customer**: Filter by customer (Administrator shows all data)
- **Period**: Filter by month/year (e.g., NOV 2020, OCT 2020)

### Features
- **Dynamic Data Loading**: Real-time data updates based on selections
- **Interactive Tables**: Sort, search, and paginate through data
- **Summary Calculations**: Automatic totals and summaries
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error handling with user feedback

## Technical Details

### Architecture
- **Backend**: PHP with Fat-Free Framework (F3)
- **Frontend**: HTML5, CSS3, JavaScript, jQuery
- **UI Framework**: AdminLTE (Bootstrap-based)
- **Data Tables**: DataTables.js
- **API**: RESTful endpoints

### Key Files
- `api/reports.php` - Main API endpoints for reports
- `ui/dist/js/pages/reports.js` - Frontend JavaScript logic
- `app/views/dashboard/main.html` - Dashboard view template
- `config/config.ini` - Application configuration

### API Endpoints
- `GET /api/reports.php?method=IOT_GetReportsList` - Get available reports
- `GET /api/reports.php?method=IOT_GetCustomerList` - Get customer list
- `GET /api/reports.php?method=IOT_GetUsagePeriodList` - Get available periods
- `GET /api/reports.php?method=IOT_GetReportColumns` - Get report columns
- `GET /api/reports.php?method=IOT_GetReport` - Get report data