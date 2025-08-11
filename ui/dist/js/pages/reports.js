/**
 * IOT PORTAL 1.0.0
 * ------------------
 * Description:
 *      This is a js file used only for the reporting cards.
 */

function GetCustomersList() {
    $('#admin_customer').show()
    getFromAPI({
        method: 'IOT_GetCustomerList'
    }, function (data) {
        if (data.message != null) {
            $('#sel_customer')
                .find('option')
                .remove()
                .end()
            $('#sel_customer')
                .append('<option value="">Select One</option>')
            for (i = 0; i < data.message.length; i++) {
                var value = data.message[i]['customer']
                var text = data.message[i]['customer']
                if (value != null) {
                    selected = ''
                    $('#sel_customer')
                        .append('<option value="' + value + '" ' + selected + '>' + text + '</option>')
                }
            }
        }
    })
}

function GetPeriodList() {
    getFromAPI({
        method: 'IOT_GetUsagePeriodList'
    }, function (data) {
        if (data.message != null) {
            $('#sel_date')
                .find('option')
                .remove()
                .end()
            $('#sel_date')
                .append('<option value="">Select One</option>')
            for (i = 0; i < data.message.length; i++) {
                var value = data.message[i]['period']
                var text = data.message[i]['period']
                if (value != null) {
                    $('#sel_date')
                        .append($('<option>', {
                            value: value,
                            text: text
                        }))
                }
            }
        }
    })
}

function GetReportsList() {
    $('#sel_report')
        .find('option')
        .remove()
        .end()
    $('#sel_report')
        .append('<option value="">Select One</option>')
    getFromAPI({
        method: 'IOT_GetReportsList',
    }, function (data) {
        if (data.message != null) {
            for (i = 0; i < data.message.length; i++) {
                var value = data.message[i]
                var text = data.message[i]
                if (value != null) {
                    $('#sel_report')
                        .append($('<option>', {
                            value: value,
                            text: text
                        }))
                }
            }
        }
    })
}


function ExportReport(fileFormat) {
    //do something
    ShowExportReportDialog(fileFormat, $('#sel_report').val(), $('#sel_customer').val(), $('#sel_date').val())

}

function GetReport() {

    isError = false
    if ($('#sel_report').val() == '') {
        toastr.error('Error - Please select a valid report.');
        isError = true
    }
    if ($('#sel_date').val() == '') {
        toastr.error('Error - Please select a valid reporting period.');
        isError = true
    }
    if ($('#sel_customer').val() == '') {
        toastr.error('Error - Please select a valid customer');
        isError = true
    }
    if (isError) return

    // Show loading immediately
    $('#reports-loading').show()
    $('#reports-body').hide()

    // If a DataTable is already bound to the element, destroy it first
    if ($.fn.DataTable && $.fn.DataTable.isDataTable('#report_list')) {
        try {
            $('#report_list').DataTable().clear().destroy(true);
            console.log('Frontend Debug - Existing DataTable destroyed');
        } catch (e) {
            console.log('Frontend Debug - Error destroying DataTable:', e);
        }
    }
    
    // Reset handles and DOM - ensure table structure exists
    result_table = null;
    
    // Completely rebuild the table structure
    $('#report_list').remove();
    $('#reports-body').append('<table class="display table table-striped" id="report_list"><thead></thead><tbody></tbody><tfoot></tfoot></table>');
    
    console.log('Frontend Debug - Table structure rebuilt');

    // fail fast if DataTables is not present
    if (!$.fn.DataTable) {
        $('#reports-loading').hide();
        $('#reports-body').show();
        alert('Error: DataTables library is not loaded.');
        return;
    }

    //show loading
    $('#reports-loading').show()
    $('#reports-body').hide()
    var columns = [];
    getFromAPI({
        method: 'IOT_GetReportColumns',
        report: $('#sel_report').val(),
    }, function (data) {
        result_table_columns = data.message;
        var columns = $.map(data.message, function (v) {
            return {
                data: function (row) { return (row && row[v] != null) ? row[v] : ''; },
                title: v
            };
        });

        // Build thead based on columns
        var thead = '<tr>';
        for (var i = 0; i < columns.length; i++) {
            thead += '<th>' + columns[i].title + '</th>';
        }
        thead += '</tr>';
        $('#report_list thead').html(thead);

        //set the report header.
        var reportName = 'Report: ' + $('#sel_report').val() + ' <br> Customer: ' + $('#sel_customer').val() + ' <br> Period: ' + $('#sel_date').val();

        //set footer
        var str = '<tr class="text-bold">';
        for (var k in columns) {
            str += '<td></td>'
        }
        str += '</tr>';
        $('#report_list tfoot').html(str);

        // Now fetch the data
        getFromAPI({
            method: 'IOT_GetReport',
            report: $('#sel_report').val(),
            customer: $('#sel_customer').val(),
            period: $('#sel_date').val(),
            nocache: 1
        }, function (json) {
            console.log('Frontend Debug - Received data:', json);
            var tableData = (json && json.message && json.message.result) ? json.message.result : [];
            console.log('Frontend Debug - Table data length:', tableData.length);
            
            // If no data, show a message row
            if (tableData.length === 0) {
                var emptyRow = '<tr><td colspan="' + columns.length + '" class="text-center text-muted">No data found for the selected criteria.</td></tr>';
                $('#report_list tbody').html(emptyRow);
            }
            
            // Initialize DataTable with the fetched data
            console.log('Frontend Debug - About to initialize DataTable with', tableData.length, 'rows');
            
            try {
                result_table = $('#report_list')
                    .DataTable({
                        "dom":
                            "<'row'<'col-sm-12 col-md-6'<'text-gray font-weight-bold report-caption'>><'col-sm-12 col-md-6 text-right pt-5'lf>>" +
                            "<'row'<'col-sm-12'tr>>" +
                            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
                        "processing": true,
                        "serverSide": false,
                        deferRender: true,
                        data: tableData,
                        'paging': true,
                        'lengthChange': false,
                        'searching': false,
                        'ordering': true,
                        'info': true,
                        'autoWidth': false,
                        'responsive': true,
                        'pageLength': 10,
                        'columns': columns,
                        'initComplete': function () {
                            console.log('Frontend Debug - DataTable initComplete called');
                            var api = this.api();
                            $('.report-caption').html(reportName);
                            
                            // Force show the table body
                            $('#reports-loading').hide();
                            $('#reports-body').show();
                            $('#report_list').show();
                            
                            try {
                                var totalRows = api.data().length;
                                console.log('Frontend Debug - DataTable initialized with', totalRows, 'rows');
                                if (totalRows > 0) {
                                    if (typeof toastr !== 'undefined') toastr.success('Report loaded (' + totalRows + ' rows).');
                                } else {
                                    if (typeof toastr !== 'undefined') toastr.info('No rows found for the selected filters.');
                                }
                            } catch (e) { 
                                console.error('Error in initComplete:', e);
                            }
                            if (json && json.message && json.message.summary) {
                                if (api.column(0).footer()) {
                                    $(api.column(0).footer()).css("text-align", "right").html("Total");
                                    $.each(json.message.summary, function (index, value) {
                                        var colIdx = result_table_columns.indexOf(index);
                                        if (colIdx >= 0 && api.column(colIdx).footer()) {
                                            $(api.column(colIdx).footer()).html(parseFloat(value).toFixed(2));
                                        }
                                    });
                                }
                            }
                            
                            // Double-check table is visible
                            setTimeout(function() {
                                if ($('#reports-body').is(':hidden')) {
                                    console.log('Frontend Debug - Forcing table to show');
                                    $('#reports-body').show();
                                    $('#report_list').show();
                                }
                            }, 100);
                        },
                        "language": {
                            "processing": '<div class="spinner-border" role="status"> <span class="sr-only">Loading...</span> </div>'
                        }
                    });
                
                console.log('Frontend Debug - DataTable initialization completed');
                
                // Test: Check if DataTable was actually created
                setTimeout(function() {
                    console.log('Frontend Debug - Testing DataTable state...');
                    console.log('Frontend Debug - Is DataTable:', $.fn.DataTable.isDataTable('#report_list'));
                    console.log('Frontend Debug - Table rows:', $('#report_list tbody tr').length);
                    console.log('Frontend Debug - Table HTML:', $('#report_list').html().substring(0, 200) + '...');
                }, 500);
                
                // Fallback: if initComplete doesn't fire, show the table anyway
                setTimeout(function() {
                    if ($('#reports-body').is(':hidden')) {
                        console.log('Frontend Debug - Fallback: forcing table to show');
                        $('#reports-loading').hide();
                        $('#reports-body').show();
                        $('#report_list').show();
                        if (typeof toastr !== 'undefined') toastr.success('Report loaded (' + tableData.length + ' rows).');
                    }
                    
                    // Additional debugging - check what's actually visible
                    console.log('Frontend Debug - reports-loading visible:', $('#reports-loading').is(':visible'));
                    console.log('Frontend Debug - reports-body visible:', $('#reports-body').is(':visible'));
                    console.log('Frontend Debug - report_list visible:', $('#report_list').is(':visible'));
                    console.log('Frontend Debug - report_list display:', $('#report_list').css('display'));
                    console.log('Frontend Debug - reports-body display:', $('#reports-body').css('display'));
                    
                    // Test DataTable state
                    console.log('Frontend Debug - Testing DataTable state...');
                    var isDataTable = $.fn.DataTable && $.fn.DataTable.isDataTable('#report_list');
                    console.log('Frontend Debug - Is DataTable:', isDataTable);
                    
                    if (isDataTable) {
                        var dt = $('#report_list').DataTable();
                        console.log('Frontend Debug - Table rows:', dt.data().length);
                        var tableHtml = $('#report_list').html();
                        console.log('Frontend Debug - Table HTML:', tableHtml ? tableHtml.substring(0, 100) + '...' : 'No HTML');
                    } else {
                        console.log('Frontend Debug - Not a DataTable, table HTML:', $('#report_list').html() ? 'Present' : 'Missing');
                    }
                    
                    // Force show everything
                    $('#reports-loading').hide();
                    $('#reports-body').show().css('display', 'block');
                    $('#report_list').show().css('display', 'table');
                    
                    // Add a test message to see if the container is working
                    if ($('#reports-body').find('table').length === 0) {
                        $('#reports-body').html('<div class="alert alert-info">Table container is working - DataTable may have failed</div>');
                    }
                }, 1000);
                
            } catch (e) {
                console.error('Frontend Debug - Error initializing DataTable:', e);
                // Fallback: show data in a simple table
                $('#reports-loading').hide();
                $('#reports-body').show();
                $('#report_list').show();
                
                // Build a simple table manually
                var tableHtml = '<table class="table table-striped">';
                tableHtml += '<thead><tr>';
                for (var i = 0; i < columns.length; i++) {
                    tableHtml += '<th>' + columns[i].title + '</th>';
                }
                tableHtml += '</tr></thead><tbody>';
                
                for (var j = 0; j < tableData.length; j++) {
                    tableHtml += '<tr>';
                    for (var k = 0; k < columns.length; k++) {
                        var value = tableData[j][columns[k].title] || '';
                        tableHtml += '<td>' + value + '</td>';
                    }
                    tableHtml += '</tr>';
                }
                tableHtml += '</tbody></table>';
                
                $('#report_list').html(tableHtml);
                if (typeof toastr !== 'undefined') toastr.success('Report loaded (' + tableData.length + ' rows).');
            }
        }, function(error) {
            // Error handling
            console.error('API Error:', error);
            $('#reports-loading').hide();
            $('#reports-body').show();
            if (typeof toastr !== 'undefined') toastr.error('Failed to load report data.');
        }, false);
    }, function(error) {
        // Error handling for columns
        console.error('Columns API Error:', error);
        $('#reports-loading').hide();
        $('#reports-body').show();
        if (typeof toastr !== 'undefined') toastr.error('Failed to load report columns.');
    }, false);

}

function ShowOrdersReport() {

    //show loading
    $('#reports-loading').show()
    $('#reports-body').hide()

    var current_date = new Date()
    var cyear = current_date.getFullYear()
    var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var short_month = shortMonths[current_date.getMonth()];
    var period = short_month.toUpperCase() + ' ' + current_date.getFullYear()

    $('#sel_report').val('Order List')
    $('#sel_date').val(period)

    GetReport()

    //hide loading
    $('#reports-loading').hide()
    $('#reports-body').show()

}

var result_table = null;
var result_table_columns = [];


// Register an API method that will empty the pipelined data, forcing an Ajax
$.fn.dataTable.Api.register('clearPipeline()', function () {
    return this.iterator('table', function (settings) {
        settings.clearCache = true;
    });
});

$.fn.dataTable.pipeline = function (opts) {
    // Configuration options
    var conf = $.extend({
        pages: 10,     // number of pages to cache
        url: '',      // script url
        data: null,   // function or object with parameters to send to the server
        // matching how `ajax.data` works in DataTables
        method: 'GET' // Ajax HTTP method
    }, opts);

    // Private variables for storing the cache
    var cacheLower = -1;
    var cacheUpper = null;
    var cacheLastRequest = null;
    var cacheLastJson = null;

    return function (request, drawCallback, settings) {

        var ajax = false;
        var requestStart = request.start;
        var drawStart = request.start;
        var requestLength = request.length;
        var requestEnd = requestStart + requestLength;
        if (settings.clearCache) {
            // API requested that the cache be cleared
            ajax = true;
            settings.clearCache = false;
        } else if (cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper) {
            // outside cached data - need to make a request
            ajax = true;
        } else if (JSON.stringify(request.order) !== JSON.stringify(cacheLastRequest.order))
        {
            // properties changed (ordering, columns, searching)
            ajax = true;
        }

        // Store the request for checking next time around
        cacheLastRequest = $.extend(true, {}, request);

        if (ajax) {
            var ajaxData = {};

            // Need data from the server
            if (requestStart < cacheLower) {
                requestStart = requestStart - (requestLength * (conf.pages - 1));

                if (requestStart < 0) {
                    requestStart = 0;
                }
            }

            cacheLower = requestStart;
            cacheUpper = requestStart + (requestLength * conf.pages);

            //Request data
            ajaxData.sort = "`" + request.columns[request.order[0].column].data + "` " + request.order[0].dir;
            ajaxData.start = requestStart;
            ajaxData.length = requestLength * conf.pages;


            // Provide the same `data` options as DataTables.
            if (typeof conf.data === 'function') {
                var d = conf.data(ajaxData);
                if (d) {
                    $.extend(ajaxData, d);
                }
            } else if ($.isPlainObject(conf.data)) {
                $.extend(ajaxData, conf.data);
            }

            return $.ajax({
                "type": conf.method,
                "url": conf.url,
                "data": ajaxData,
                "dataType": "json",
                "cache": false,
                "success": function (json) {
                    if (json.message.Error != null) {
                        toastr.error(json.message.Error);
                        dt = {
                            "data": [],
                            "recordsTotal": 0,
                            "recordsFiltered": 0
                        }
                    } else if (json.message.toString().indexOf("FAIL") !== -1) {
                        toastr.error(json.message);
                        dt = {
                            "data": [],
                            "recordsTotal": 0,
                            "recordsFiltered": 0
                        }
                    } else {
                        dt = {
                            "data": json.message.result,
                            "recordsTotal": json.message.total,
                            "recordsFiltered": json.message.total
                        }
                    }

                    cacheLastJson = $.extend(true, {}, dt);

                    if (cacheLower != drawStart) {
                        dt.data.splice(0, drawStart - cacheLower);
                    }
                    if (requestLength >= -1) {
                        dt.data.splice(requestLength, dt.data.length);
                    }

                    drawCallback(dt);
                    if (json.message.summary) {
                        $(result_table.column(0).footer()).css("text-align", "right").html("Total");
                        $.each(json.message.summary, function (index, value) {
                            $(result_table.column(result_table_columns.indexOf(index)).footer()).html(parseFloat(value).toFixed(2));

                        });

                    }

                }
            });
        } else {
            dt = $.extend(true, {}, cacheLastJson);
            //dt.draw = request.draw;
            dt.data.splice(0, requestStart - cacheLower);
            dt.data.splice(requestLength, dt.data.length);

            drawCallback(dt);
        }
    }
};

var request_method_list = "";
var getFromAPI = function (dataparam, action, fail, is_async) {
    var request_method = dataparam.method;
    if (!request_method_list.includes(request_method)) {
        request_method_list += '<h5><strong>' + request_method + ' failed to load.</strong></h5>'
    }
    var maxtimeout = 180000;  //maxtimeout of 180 seconds (180 * 1000ms)
    var baseurl = "/api/reports.php";
    if (is_async == null) is_async = true;
    $.ajax({
        method: 'GET',
        type: 'JSON',
        contentType: 'application/json; charset=utf-8',
        url: baseurl,
        async: is_async,
        data: dataparam,
        dataType: 'JSON',
        //timeout: maxtimeout,
        success: function (data) {
            data = eval(data);
            if (action) action(data)
        },
        error: function (m) {
            var err = (m.responseJSON != null ? m.responseJSON : {
                status: false,
                message: [m.responseText]
            });
            if (!err.message) {
                err = {message: [err]}
            }
            console.log(err);
        }
    })
};

if (typeof jQuery === "undefined") {
   alert("AdminLTE requires jQuery");
}

//load this at the start of each page.
$(document).ready(function () {

    //show loading status
    $('#reports-loading').show()
    $('#reports-body').hide()

    //load dropdowns
    GetReportsList();
    GetPeriodList();
    GetCustomersList();

    //hide loading status
    $('#reports-loading').hide()
    $('#reports-body').show()


})
