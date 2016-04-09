//table code draws from  https://vis4.net/blog/posts/making-html-tables-in-d3-doesnt-need-to-be-a-pain/ (d3 table) and http://blog.apps.npr.org/2014/05/09/responsive-data-tables.html (responsive table)

function chartable() {

    var formatMinutes = d3.format('.0f');

    // column definitions
    var columns = [
        {
            head: 'Character',
            cl: 'left',
            html: function (d) {
                return d.character;
            }
        },
        {
            head: 'Episodes',
            cl: 'num',
            html: function (d) {
                return d.episodesin;
            }
        }, {
            head: 'Minutes',
            cl: 'num',
            html: function (d) {
                return formatMinutes(d.totalminutes);
            }
        }, {
            head: 'Characters Impersonated',
            cl: 'left',
            html: function (d) {
                return d.cloneswaps;
            }
        }
    ];

    // create table
    var table = d3.select("#table")
        .append('table');

    // create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', function (d) {
            return d.cl;
        })
        .text(function (d) {
            return d.head;
        });

    // create table body
    table.append('tbody')
        .selectAll('tr')
        .data(tabledata).enter()
        .append('tr')
        .selectAll('td')
        .data(function (row, i) {
            return columns.map(function (c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function (k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(function (d) {
            return d.html;
        })
        .attr('class', function (d) {
            return d.cl;
        })
        .attr("id", function (d) {
            return d.head;
        });
}

var tabledata;
d3.csv("data/charactertable.csv", function (error, rows) {
    tabledata = rows;
    chartable();
    
    var pymChild = new pym.Child();
});
