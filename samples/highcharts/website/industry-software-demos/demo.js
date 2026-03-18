function treemap() {
    const renderChart = data => {
        Highcharts.chart('container', {
            chart: {
                backgroundColor: '#252931'
            },
            series: [{
                name: 'All',
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                allowTraversingTree: true,
                animationLimit: 1000,
                borderColor: '#252931',
                color: '#252931',
                opacity: 0.01,
                nodeSizeBy: 'leaf',
                dataLabels: {
                    enabled: false,
                    allowOverlap: true,
                    style: {
                        fontSize: '0.9em',
                        textOutline: 'none'
                    }
                },
                levels: [{
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        headers: true,
                        align: 'left',
                        style: {
                            fontWeight: 'bold',
                            fontSize: '0.7em',
                            lineClamp: 1,
                            textTransform: 'uppercase'
                        },
                        padding: 3
                    },
                    borderWidth: 3,
                    levelIsConstant: false
                }, {
                    level: 2,
                    dataLabels: {
                        enabled: true,
                        headers: true,
                        align: 'center',
                        shape: 'callout',
                        backgroundColor: 'gray',
                        borderWidth: 1,
                        borderColor: '#252931',
                        padding: 0,
                        style: {
                            color: 'white',
                            fontWeight: 'normal',
                            fontSize: '0.6em',
                            lineClamp: 1,
                            textOutline: 'none',
                            textTransform: 'uppercase'
                        }
                    },
                    groupPadding: 1

                    // The companies
                }, {
                    level: 3,
                    dataLabels: {
                        enabled: true,
                        align: 'center',
                        // eslint-disable-next-line max-len
                        format: '{point.name}<br><span style="font-size: 0.7em">' +
                        '{point.custom.performance}</span>',
                        style: {
                            color: 'white'
                        }
                    }
                }],
                accessibility: {
                    exposeAsGroupOnly: true
                },
                breadcrumbs: {
                    buttonTheme: {
                        style: {
                            color: 'silver'
                        },
                        states: {
                            hover: {
                                fill: '#333'
                            },
                            select: {
                                style: {
                                    color: 'white'
                                }
                            }
                        }
                    }
                },
                data
            }],
            title: {
                text: 'S&P 500 Companies',
                align: 'left',
                style: {
                    color: 'white'
                }
            },
            subtitle: {
                text: 'Click points to drill down. Source: <a href="http://okfn.org/">okfn.org</a>.',
                align: 'left',
                style: {
                    color: 'silver'
                }
            },
            tooltip: {
                outside: true,
                headerFormat: '<span style="font-size: 0.9em">' +
                '{point.custom.fullName}</span><br/>',
                pointFormat: '<b>Market Cap:</b>' +
                ' USD {(divide point.value 1000000000):.1f} bln<br/>' +
                '{#if point.custom.performance}' +
                '<b>1 month performance:</b> {point.custom.performance}{/if}'
            },
            colorAxis: {
                minColor: '#f73539',
                maxColor: '#2ecc59',
                stops: [
                    [0, '#f73539'],
                    [0.5, '#414555'],
                    [1, '#2ecc59']
                ],
                min: -10,
                max: 10,
                gridLineWidth: 0,
                labels: {
                    overflow: 'allow',
                    format: '{#gt value 0}+{value}{else}{value}{/gt}%',
                    style: {
                        color: 'white'
                    }
                }
            },
            legend: {
                itemStyle: {
                    color: 'white'
                }
            },
            exporting: {
                sourceWidth: 1200,
                sourceHeight: 800,
                buttons: {
                    fullscreen: {
                        text: '<i class="fa fa-arrows-alt"></i> Fullscreen',
                        onclick: function () {
                            this.fullscreen.toggle();
                        }
                    },
                    contextButton: {
                        menuItems: [
                            'downloadPNG',
                            'downloadJPEG',
                            'downloadPDF',
                            'downloadSVG'
                        ],
                        text: '<i class="fa fa-share-alt"></i> Export',
                        symbol: void 0,
                        y: -2
                    }
                }
            },
            navigation: {
                buttonOptions: {
                    theme: {
                        fill: '#252931',
                        style: {
                            color: 'silver',
                            whiteSpace: 'nowrap'
                        },
                        states: {
                            hover: {
                                fill: '#333',
                                style: {
                                    color: 'white'
                                }
                            }
                        }
                    },
                    symbolStroke: 'silver',
                    useHTML: true,
                    y: -2
                }
            }
        });
    };

    (async () => {

        // Plugin for relative font size
        Highcharts.addEvent(Highcharts.Series, 'drawDataLabels', function () {
            if (this.type === 'treemap') {
                this.points.forEach(point => {

                    // Color the level 2 headers with
                    // the combined performance of
                    // its children
                    // eslint-disable-next-line max-len
                    if (point.node.level === 2 && Number.isFinite(point.value)) {
                        const previousValue = point.node.children
                            .reduce(
                                (acc, child) => acc + (child.point.value || 0) -
                            (child.point.value || 0) *
                            (child.point.colorValue || 0) / 100,
                                0
                            );

                        // Percentage change from previous value to point.value
                        const perf = 100 * (point.value - previousValue) /
                        (previousValue || 1);

                        point.custom = {
                            performance: (perf < 0 ? '' : '+') +
                            perf.toFixed(2) + '%'
                        };

                        if (point.dlOptions) {
                            point.dlOptions.backgroundColor = this.colorAxis
                                .toColor(perf);
                        }
                    }

                    // Set font size based on area of the point
                    if (point.node.level === 3 && point.shapeArgs) {
                        // eslint-disable-next-line max-len
                        const area = point.shapeArgs.width * point.shapeArgs.height;
                        point.dlOptions.style.fontSize =
                        `${Math.min(32, 7 + Math.round(area * 0.0008))}px`;
                    }
                });
            }
        });

        const getCSV = async url => {
            const csv = await fetch(url).then(response => response.text());

            const data = new Highcharts.Data({ csv });

            const arr = data.columns[0]
                .map((_, i) => data.columns.reduce((obj, column) => {
                    obj[column[0]] = column[i];
                    return obj;
                }, {}));
            return arr;
        };

        // Data updated every month, so we load
        // this month and the last and make a
        // comparison.
        // https://github.com/datasets/s-and-p-500-companies-financials/commits/main/data/constituents-financials.csv
        const csvData = await getCSV(
            'https://cdn.jsdelivr.net/gh/datasets/s-and-p-500-companies-financials@67dd99e/data/constituents-financials.csv'
        );

        const oldData = await getCSV(
            'https://cdn.jsdelivr.net/gh/datasets/s-and-p-500-companies-financials@9f63bc5/data/constituents-financials.csv'
        );

        // Create the industries for the top level
        const data = [{
            id: 'Technology'
        }, {
            id: 'Financial'
        }, {
            id: 'Consumer Cyclical'
        }, {
            id: 'Communication Services'
        }, {
            id: 'Healthcare'
        }, {
            id: 'Consumer Defensive'
        }, {
            id: 'Industrials'
        }, {
            id: 'Real Estate'
        }, {
            id: 'Energy'
        }, {
            id: 'Utilities'
        }, {
            id: 'Basic Materials'
        }];

        // Create a static mapping object where of the sectors above is
        // mapped to an industry in the industries array.
        const sectorToIndustry = {
            'Industrial Conglomerates': 'Industrials',
            'Building Products': 'Industrials',
            'Health Care Equipment': 'Healthcare',
            Biotechnology: 'Healthcare',
            'IT Consulting & Other Services': 'Technology',
            'Application Software': 'Technology',
            Semiconductors: 'Technology',
            'Independent Power Producers & Energy Traders': 'Energy',
            'Life & Health Insurance': 'Financial',
            'Life Sciences Tools & Services': 'Healthcare',
            'Industrial Gases': 'Basic Materials',
            'Hotels, Resorts & Cruise Lines': 'Consumer Cyclical',
            'Internet Services & Infrastructure': 'Technology',
            'Specialty Chemicals': 'Basic Materials',
            'Office REITs': 'Real Estate',
            'Health Care Supplies': 'Healthcare',
            'Electric Utilities': 'Utilities',
            'Property & Casualty Insurance': 'Financial',
            'Interactive Media & Services': 'Communication Services',
            Tobacco: 'Consumer Defensive',
            'Broadline Retail': 'Consumer Cyclical',
            'Paper & Plastic Packaging Products & Materials': 'Basic Materials',
            'Diversified Support Services': 'Industrials',
            'Multi-Utilities': 'Utilities',
            'Consumer Finance': 'Financial',
            'Multi-line Insurance': 'Financial',
            'Telecom Tower REITs': 'Real Estate',
            'Water Utilities': 'Utilities',
            'Asset Management & Custody Banks': 'Financial',
            'Electrical Components & Equipment': 'Industrials',
            'Electronic Components': 'Technology',
            'Insurance Brokers': 'Financial',
            'Oil & Gas Exploration & Production': 'Energy',
            'Technology Hardware, Storage & Peripherals': 'Technology',
            'Semiconductor Materials & Equipment': 'Technology',
            'Automotive Parts & Equipment': 'Consumer Cyclical',
            'Agricultural Products & Services': 'Consumer Defensive',
            'Communications Equipment': 'Technology',
            'Integrated Telecommunication Services': 'Communication Services',
            'Gas Utilities': 'Utilities',
            'Human Resource & Employment Services': 'Industrials',
            'Automotive Retail': 'Consumer Cyclical',
            'Multi-Family Residential REITs': 'Real Estate',
            'Aerospace & Defense': 'Industrials',
            'Oil & Gas Equipment & Services': 'Energy',
            'Metal, Glass & Plastic Containers': 'Basic Materials',
            'Diversified Banks': 'Financial',
            'Multi-Sector Holdings': 'Financial',
            'Computer & Electronics Retail': 'Consumer Cyclical',
            Pharmaceuticals: 'Healthcare',
            'Data Processing & Outsourced Services': 'Technology',
            'Distillers & Vintners': 'Consumer Defensive',
            'Air Freight & Logistics': 'Industrials',
            'Casinos & Gaming': 'Consumer Cyclical',
            'Packaged Foods & Meats': 'Consumer Defensive',
            'Health Care Distributors': 'Healthcare',
            'Construction Machinery & Heavy Transportation Equipment':
            'Industrials',
            'Financial Exchanges & Data': 'Financial',
            'Real Estate Services': 'Real Estate',
            'Technology Distributors': 'Technology',
            'Managed Health Care': 'Healthcare',
            'Fertilizers & Agricultural Chemicals': 'Basic Materials',
            'Investment Banking & Brokerage': 'Financial',
            'Cable & Satellite': 'Communication Services',
            'Integrated Oil & Gas': 'Energy',
            Restaurants: 'Consumer Cyclical',
            'Household Products': 'Consumer Defensive',
            'Health Care Services': 'Healthcare',
            'Regional Banks': 'Financial',
            'Soft Drinks & Non-alcoholic Beverages': 'Consumer Defensive',
            'Transaction & Payment Processing Services': 'Technology',
            'Consumer Staples Merchandise Retail': 'Consumer Defensive',
            'Systems Software': 'Technology',
            'Rail Transportation': 'Industrials',
            Homebuilding: 'Consumer Cyclical',
            Footwear: 'Consumer Cyclical',
            'Agricultural & Farm Machinery': 'Consumer Cyclical',
            'Passenger Airlines': 'Industrials',
            'Data Center REITs': 'Real Estate',
            'Industrial Machinery & Supplies & Components': 'Industrials',
            'Commodity Chemicals': 'Basic Materials',
            'Interactive Home Entertainment': 'Communication Services',
            'Research & Consulting Services': 'Industrials',
            'Personal Care Products': 'Consumer Defensive',
            Reinsurance: 'Financial',
            'Self-Storage REITs': 'Real Estate',
            'Trading Companies & Distributors': 'Industrials',
            'Retail REITs': 'Real Estate',
            'Automobile Manufacturers': 'Consumer Cyclical',
            Broadcasting: 'Communication Services',
            Copper: 'Basic Materials',
            'Consumer Electronics': 'Technology',
            'Heavy Electrical Equipment': 'Industrials',
            Distributors: 'Industrials',
            'Leisure Products': 'Consumer Cyclical',
            'Health Care Facilities': 'Healthcare',
            'Health Care REITs': 'Real Estate',
            'Home Improvement Retail': 'Consumer Cyclical',
            'Hotel & Resort REITs': 'Real Estate',
            Advertising: 'Communication Services',
            'Single-Family Residential REITs': 'Real Estate',
            'Other Specialized REITs': 'Real Estate',
            'Cargo Ground Transportation': 'Industrials',
            'Electronic Manufacturing Services': 'Technology',
            'Construction & Engineering': 'Industrials',
            'Electronic Equipment & Instruments': 'Technology',
            'Oil & Gas Storage & Transportation': 'Energy',
            'Food Retail': 'Consumer Defensive',
            'Movies & Entertainment': 'Communication Services',
            'Apparel, Accessories & Luxury Goods': 'Consumer Cyclical',
            'Oil & Gas Refining & Marketing': 'Energy',
            'Construction Materials': 'Basic Materials',
            'Home Furnishings': 'Consumer Cyclical',
            Brewers: 'Consumer Defensive',
            Gold: 'Basic Materials',
            Publishing: 'Communication Services',
            Steel: 'Basic Materials',
            'Industrial REITs': 'Real Estate',
            'Environmental & Facilities Services': 'Industrials',
            'Apparel Retail': 'Consumer Cyclical',
            'Health Care Technology': 'Healthcare',
            'Food Distributors': 'Consumer Defensive',
            'Wireless Telecommunication Services': 'Communication Services',
            'Other Specialty Retail': 'Consumer Cyclical',
            'Passenger Ground Transportation': 'Industrials',
            'Drug Retail': 'Consumer Cyclical',
            'Timber REITs': 'Real Estate'
        };


        // Create the sectors for the second level
        csvData.forEach(row => {
            const sector = row.Sector;
            if (!data.find(point => point.id === sector)) {
                data.push({
                    id: sector,
                    parent: sectorToIndustry[sector]
                });
            }
        });

        // Register name for the categories and sectors
        data.forEach(point => {
            point.name = point.id;
            point.custom = {
                fullName: point.id
            };
        });

        csvData
            .filter(row =>
            // Google class C usually left out in visualizations like this
                row.Symbol !== 'GOOG' &&
            row.Price &&
            row['Market Cap']
            )
            .forEach(row => {
                const old = oldData
                    .find(oldRow => oldRow.Symbol === row.Symbol);

                let perf = null;
                if (old) {
                    const oldPrice = parseFloat(old.Price),
                        newPrice = parseFloat(row.Price);
                    perf = 100 * (newPrice - oldPrice) / oldPrice;
                }

                data.push({
                    name: row.Symbol,
                    id: row.Symbol,
                    value: parseFloat(row['Market Cap']),
                    parent: row.Sector,
                    colorValue: perf,
                    custom: {
                        fullName: row.Name,
                        // eslint-disable-next-line max-len
                        performance: (perf < 0 ? '' : '+') + perf.toFixed(2) + '%'
                    }
                });
            });

        renderChart(data);
    })();

}

function react() {
    Highcharts.chart('container', {
        chart: {
            type: 'bubble',
            plotBorderWidth: 1
        },
        title: {
            text: 'Simple Bubble Chart'
        },
        xAxis: {
            gridLineWidth: 1,
            title: { text: 'X Bubble Values' }
        },
        yAxis: {
            startOnTick: false,
            endOnTick: false,
            title: { text: 'Y Bubble Values' }
        },
        tooltip: {
            pointFormat: 'x: {point.x}, y: {point.y}, z: {point.z}'
        },
        series: [
            {
                type: 'bubble',
                name: 'Blue bubbles',
                data: [
                    [9, 81, 63],
                    [98, 5, 89],
                    [51, 50, 73],
                    [41, 22, 14],
                    [58, 24, 20],
                    [78, 37, 34],
                    [55, 56, 53],
                    [18, 45, 70],
                    [42, 44, 28],
                    [3, 52, 59],
                    [31, 18, 97],
                    [79, 91, 63],
                    [93, 23, 23],
                    [44, 83, 22]
                ]
            },
            {
                type: 'bubble',
                name: 'Purple bubbles',
                data: [
                    [42, 38, 20],
                    [6, 18, 1],
                    [1, 93, 55],
                    [57, 2, 90],
                    [80, 76, 22],
                    [11, 74, 96],
                    [88, 56, 10],
                    [30, 47, 49],
                    [57, 62, 98],
                    [4, 16, 16],
                    [46, 10, 11],
                    [22, 87, 89],
                    [57, 91, 82],
                    [45, 15, 98]
                ]
            }
        ]
    });


}

function areaRace() {
    const btn = document.getElementById('play-pause-button'),
        input = document.getElementById('play-range'),
        startYear = 1973,
        endYear = 2024,
        animationDuration = 400;

    // General helper functions
    const arrToAssociative = arr => {
        const tmp = {};
        arr.forEach(item => {
            tmp[item[0]] = item[1];
        });

        return tmp;
    };

    function getSubtitle() {
        return `<span style='font-size: 60px'>${input.value}</span>`;
    }

    const formatRevenue = [];

    const chart = Highcharts.chart('container', {
        chart: {
            events: {
            // Some annotation labels need to be rotated to make room
                load: function () {
                    const labels = this.annotations[0].labels;
                    labels
                        .find(a => a.options.id === 'vinyl-label')
                        .graphic.attr({
                            rotation: -20
                        });
                }
            },
            type: 'area',
            marginTop: 20,
            animation: {
                duration: animationDuration,
                easing: t => t
            }
        },
        title: {
            text: 'Music revenue race chart'
        },
        subtitle: {
            text: getSubtitle(),
            floating: true,
            align: 'right',
            verticalAlign: 'middle',
            x: -100,
            y: -110
        },
        data: {
            csv: document.getElementById('csv').innerHTML,
            itemDelimiter: '\t',
            complete: function (options) {
                for (let i = 0; i < options.series.length; i++) {
                    formatRevenue[i] = arrToAssociative(options.series[i].data);
                    options.series[i].data = null;
                }
            }
        },
        xAxis: {
            allowDecimals: false,
            min: startYear,
            max: endYear
        },
        yAxis: {
            reversedStacks: false,
            max: 20,
            title: {
                text: 'Revenue in the U.S.'
            },
            labels: {
                format: '${text} B'
            }
        },
        tooltip: {
            split: true,
            headerFormat: '<span style="font-size: 1.2em">{point.x}</span>',
            pointFormat:
            '{series.name}: <b>${point.y:,.1f} B</b> ({point.percentage:.1f}%)',
            crosshairs: true
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                pointStart: startYear,
                marker: {
                    enabled: false
                }
            }
        },
        annotations: [
            {
                labelOptions: {
                    borderWidth: 0,
                    backgroundColor: undefined,
                    verticalAlign: 'middle',
                    allowOverlap: true,
                    style: {
                        pointerEvents: 'none',
                        opacity: 0,
                        transition: 'opacity 500ms'
                    }
                },
                labels: [
                    {
                        text: 'Vinyl',
                        verticalAlign: 'top',
                        point: {
                            x: 1975,
                            xAxis: 0,
                            y: 1.45,
                            yAxis: 0
                        },
                        style: {
                            fontSize: '0.8em',
                            color: '#000'
                        },
                        id: 'vinyl-label'
                    },
                    {
                        text: 'LP-EP',
                        point: {
                            x: 1980,
                            xAxis: 0,
                            y: 0.2,
                            yAxis: 0
                        },
                        style: {
                            fontSize: '1.4em',
                            color: '#ffffff'
                        },
                        id: 'lpep-label'
                    },
                    {
                        text: 'Cass',
                        point: {
                            x: 1987,
                            xAxis: 0,
                            y: 2,
                            yAxis: 0
                        },
                        style: {
                            fontSize: '1.5em',
                            color: '#ffffff'
                        },
                        id: 'cassettes-label'
                    },
                    {
                        text: 'CD',
                        point: {
                            x: 1999,
                            xAxis: 0,
                            y: 6,
                            yAxis: 0
                        },
                        style: {
                            fontSize: '4em',
                            color: '#ffffff'
                        },
                        id: 'cd-label'
                    },
                    {
                        text: 'DL',
                        point: {
                            x: 2011,
                            xAxis: 0,
                            y: 4,
                            yAxis: 0
                        },
                        style: {
                            fontSize: '1.2em',
                            color: '#ffffff'
                        },
                        id: 'dl-label'
                    },
                    {
                        text: 'Strm',
                        point: {
                            x: 2018,
                            xAxis: 0,
                            y: 5,
                            yAxis: 0
                        },
                        style: {
                            fontSize: '1.5em',
                            color: '#ffffff'
                        },
                        id: 'streams-label'
                    }
                ]
            }
        ],

        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        title: {
                            align: 'left'
                        },
                        subtitle: {
                            y: -150,
                            x: -20
                        },
                        yAxis: {
                            labels: {
                                align: 'left',
                                x: 0,
                                y: -3
                            },
                            tickLength: 0,
                            title: {
                                align: 'high',
                                reserveSpace: false,
                                rotation: 0,
                                textAlign: 'left',
                                y: -20
                            }
                        }
                    }
                }
            ]
        }
    });

    function pause(button) {
        button.title = 'play';
        button.className = 'fa fa-play';
        clearTimeout(chart.sequenceTimer);
        chart.sequenceTimer = undefined;
    }

    function update(sliderClicked) {
        chart.update(
            {
                subtitle: {
                    text: getSubtitle()
                }
            },
            false,
            false,
            false
        );

        const series = chart.series,
            labels = chart.annotations[0].labels,
            yearIndex = input.value - startYear,
            dataLength = series[0].options.data.length;

        // If slider moved back in time
        if (yearIndex < dataLength - 1) {
            for (let i = 0; i < series.length; i++) {
                const seriesData = series[i].options.data.slice(0, yearIndex);
                series[i].setData(seriesData, false);
            }
        }

        // If slider moved forward in time
        if (yearIndex > dataLength - 1) {
            const remainingYears = yearIndex - dataLength;
            for (let i = 0; i < series.length; i++) {
                // eslint-disable-next-line max-len
                for (let j = input.value - remainingYears; j < input.value; j++) {
                    series[i].addPoint([formatRevenue[i][j]], false);
                }
            }
        }

        // Add current year
        for (let i = 0; i < series.length; i++) {
            const newY = formatRevenue[i][input.value];
            series[i].addPoint([newY], false);
        }

        labels.forEach(label => {
            label
                .graphic
                .css({
                    opacity: input.value >= label.options.point.x | 0
                });
        });

        if (sliderClicked) {
            chart.redraw(false);
        } else {
            chart.redraw();
        }

        input.value = parseInt(input.value, 10) + 1;

        if (input.value > endYear) {
        // Auto-pause
            pause(btn);
        }
    }

    function play(button) {
    // Reset slider at the end
        if (input.value > endYear) {
            input.value = startYear;
        }
        button.title = 'pause';
        button.className = 'fa fa-pause';
        chart.sequenceTimer = setInterval(function () {
            update(false);
        }, animationDuration);
    }

    btn.addEventListener('click', function () {
        if (chart.sequenceTimer) {
            pause(this);
        } else {
            play(this);
        }
    });

    play(btn);

    // Trigger the update on the range bar click.
    input.addEventListener('click', function () {
        update(true);
    });
    // Stop animation when clicking and dragging range bar
    input.addEventListener('input', function () {
        pause(btn);
    });

}

function liveData() {
    const defaultData = 'https://demo-live-data.highcharts.com/time-data.csv';
    const urlInput = document.getElementById('fetchURL');
    const pollingCheckbox = document.getElementById('enablePolling');
    const pollingInput = document.getElementById('pollingTime');

    function createChart() {
        Highcharts.chart('container', {
            chart: {
                type: 'areaspline'
            },
            lang: {
                locale: 'en-GB'
            },
            title: {
                text: 'Live Data'
            },
            accessibility: {
                announceNewData: {
                    enabled: true,
                    minAnnounceInterval: 15000,
                    announcementFormatter: function (
                        allSeries,
                        newSeries,
                        newPoint
                    ) {
                        if (newPoint) {
                            return 'New point added. Value: ' + newPoint.y;
                        }
                        return false;
                    }
                }
            },
            plotOptions: {
                areaspline: {
                    color: '#32CD32',
                    fillColor: {
                        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                        stops: [
                            [0, '#32CD32'],
                            [1, '#32CD3200']
                        ]
                    },
                    threshold: null,
                    marker: {
                        lineWidth: 1,
                        lineColor: null,
                        fillColor: 'white'
                    }
                }
            },
            data: {
                csvURL: urlInput.value,
                enablePolling: pollingCheckbox.checked === true,
                dataRefreshRate: parseInt(pollingInput.value, 10)
            }
        });

        if (pollingInput.value < 1 || !pollingInput.value) {
            pollingInput.value = 1;
        }
    }

    urlInput.value = defaultData;

    // We recreate instead of using chart update to make sure the loaded CSV
    // and such is completely gone.
    pollingCheckbox.onchange = urlInput.onchange =
   pollingInput.onchange = createChart;

    // Create the chart
    createChart();

}

function a11y() {
    const colors = [
        'var(--a11y-color-0)',
        'var(--a11y-color-1)',
        'var(--a11y-color-2)',
        'var(--a11y-color-3)',
        'var(--a11y-color-4)',
        'var(--a11y-color-5)'
    ];

    Highcharts.chart('container', {
        chart: {
            type: 'spline'
        },

        legend: {
            symbolWidth: 40
        },

        title: {
            text: 'Most common desktop screen readers',
            align: 'left'
        },

        subtitle: {
            text: 'Source: WebAIM. Click on points to visit official screen ' +
            'reader website',
            align: 'left'
        },

        yAxis: {
            title: {
                text: 'Percentage usage'
            },
            accessibility: {
                description: 'Percentage usage'
            }
        },

        xAxis: {
            title: {
                text: 'Time'
            },
            accessibility: {
                description: 'Time from December 2010 to September 2019'
            },
            categories: [
                'December 2010', 'May 2012', 'January 2014', 'July 2015',
                'October 2017', 'September 2019'
            ]
        },

        tooltip: {
            valueSuffix: '%',
            stickOnContact: true
        },

        plotOptions: {
            series: {
                className: 'a11y',
                point: {
                    events: {
                        click: function () {
                            window.location.href = this.series.options.website;
                        }
                    }
                },
                cursor: 'pointer',
                lineWidth: 2
            }
        },

        series: [
            {
                name: 'NVDA',
                data: [34.8, 43.0, 51.2, 41.4, 64.9, 72.4],
                website: 'https://www.nvaccess.org',
                color: colors[2],
                accessibility: {
                    description: 'This is the most used screen reader in 2019.'
                }
            }, {
                name: 'JAWS',
                data: [69.6, 63.7, 63.9, 43.7, 66.0, 61.7],
                website: 'https://www.freedomscientific.com/Products/Blindness/JAWS',
                dashStyle: 'ShortDashDot',
                color: colors[0]
            }, {
                name: 'VoiceOver',
                data: [20.2, 30.7, 36.8, 30.9, 39.6, 47.1],
                website: 'http://www.apple.com/accessibility/osx/voiceover',
                dashStyle: 'ShortDot',
                color: colors[1]
            }, {
                name: 'Narrator',
                data: [null, null, null, null, 21.4, 30.3],
                website: 'https://support.microsoft.com/en-us/help/22798/windows-10-complete-guide-to-narrator',
                dashStyle: 'Dash',
                color: colors[9]
            }, {
                name: 'ZoomText/Fusion',
                data: [6.1, 6.8, 5.3, 27.5, 6.0, 5.5],
                website: 'http://www.zoomtext.com/products/zoomtext-magnifierreader',
                dashStyle: 'ShortDot',
                color: colors[5]
            }, {
                name: 'Other',
                data: [42.6, 51.5, 54.2, 45.8, 20.2, 15.4],
                website: 'http://www.disabled-world.com/assistivedevices/computer/screen-readers.php',
                dashStyle: 'ShortDash',
                color: colors[3]
            }
        ],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 550
                },
                chartOptions: {
                    chart: {
                        spacingLeft: 3,
                        spacingRight: 3
                    },
                    legend: {
                        itemWidth: 150
                    },
                    xAxis: {
                        categories: [
                            'Dec. 2010', 'May 2012', 'Jan. 2014', 'July 2015',
                            'Oct. 2017', 'Sep. 2019'
                        ],
                        title: ''
                    },
                    yAxis: {
                        visible: false
                    }
                }
            }]
        }
    });

}

function activity() {
    fetch('https://api.github.com/repos/highcharts/highcharts/stats/commit_activity')
        .then(res => res.json())
        .then(weeks => {
            const data = weeks.map(w => [w.week * 1000, w.total]);

            Highcharts.chart('container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Highcharts GitHub Activity'
                },
                subtitle: {
                    // eslint-disable-next-line max-len
                    text: 'Highcharts is actively maintained with continuous commits'
                },
                xAxis: {
                    type: 'datetime',
                    title: { text: null }
                },
                yAxis: {
                    title: { text: 'Commits' },
                    labels: {
                        format: '{value}'
                    }
                },
                tooltip: {
                    xDateFormat: '%B %Y',
                    valueSuffix: ' commits'
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Commits per week',
                    data: data,
                    color: '#1db954'
                }]
            });
        });
}

const params = new URLSearchParams(window.location.search);
const chartToShow = params.get('chart') ?? 'treemap';

const demoCard = document.getElementById('demoCard');
const demoName = document.getElementById('demoName');
const demoDescription = document.getElementById('demoDescription');
const productButtons = document.getElementById('productButtons');
const chartDescription = document.getElementById('chartDescription');
const codeContainer = document.getElementById('code-container');
const chartContainer = document.getElementById('container');
const playControls = document.getElementById('play-controls');
const pollingControls = document.getElementById('ld-form');
const productInfo = {
    core: {
        name: 'Core',
        icon: 'https://www.highcharts.com/demo/icons/products/core.svg',
        url: 'https://www.highcharts.com/products/highcharts/'
    },
    stock: {
        name: 'Stock',
        icon: 'https://www.highcharts.com/demo/icons/products/stock.svg',
        url: 'https://www.highcharts.com/products/stock/'
    },
    maps: {
        name: 'Maps',
        icon: 'https://www.highcharts.com/demo/icons/products/maps.svg',
        url: 'https://www.highcharts.com/products/maps/'
    },
    gantt: {
        name: 'Gantt',
        icon: 'https://www.highcharts.com/demo/icons/products/gantt.svg',
        url: 'https://www.highcharts.com/products/gantt/'
    },
    dashboards: {
        name: 'Dashboards',
        icon: 'https://www.highcharts.com/demo/icons/products/dashboards.svg',
        url: 'https://www.highcharts.com/products/dashboards/'
    },
    grid: {
        name: 'Grid',
        icon: 'https://www.highcharts.com/demo/icons/products/grid.svg',
        url: 'https://www.highcharts.com/products/grid/'
    },
    morningstar: {
        name: 'Morningstar',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1483_3937)">
                <path d="M13.7999 13.6C14.6799 12.4333 15.1998 10.9926 15.1998 
                9.43158C15.1998 5.54856 11.9762 2.40002 8.0003 2.40002C4.02442 
                2.40002 0.799805 5.54856 0.799805 9.43158C0.799805 
                10.9915 1.31932 
                12.4341 2.19844 13.6H3.696C2.6088 12.5293 1.9372 11.0588 1.9372 
                9.43158C1.9372 6.16186 4.65152 3.5106 8.0003 
                3.5106C11.3491 3.5106 
                14.063 6.16186 14.063 9.43158C14.063 11.0566 13.3925 12.5293 
                12.3076 13.6H13.7999Z" fill="#E93D42"/>
                </g>
                <defs>
                <clipPath id="clip0_1483_3937">
                <rect width="16" height="16" fill="white"/>
                </clipPath>
                </defs>
                </svg>`,
        url: 'https://www.highcharts.com/products/data-connector-for-morningstar/'
    }
};

const charts = {
    treemap: {
        run: treemap,
        demoCardLabel: 'Treemap with large dataset',
        demoName: 'Treemap with large dataset',
        demoDescription: `A treemap with drilling capability
        is a powerful chart to visualize comparison and hierarchy.`,
        chartDescription: `A purely decorative chart demonstrating 
        Highcharts Treemap.`,
        madeWith: ['core']
    },
    react: {
        run: react,
        demoCardLabel: 'React Integration Demo',
        demoName: ` <div class="hc-button hc-button--plain 
        hc-button--size-200 code-button" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" 
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_2325_1891)">
            <path d="M12.8812 5.46022C12.7186 5.40576 
            12.5561 5.35426 12.3936 5.30585C12.4207 
            5.1939 12.4448 5.08191 12.4688 4.96994C12.839 
            3.16627 12.5952 1.71668 11.7737 1.23853C10.9823 
            0.781555 9.69129 1.25668 8.38528 2.40062C8.25585 
            2.51258 8.12951 2.63064 8.0091 2.74864C7.92785 
            2.66996 7.84365 2.59127 7.75938 2.51562C6.39013 
            1.293 5.0179 0.778545 4.19637 1.25971C3.40795 
            1.71973 3.17322 3.08461 3.50424 4.79139C3.53735 
            4.96086 3.57346 5.1273 3.61559 5.29678C3.42299 
            5.35124 3.23341 5.4118 3.05587 5.47533C1.44893 
            6.03521 0.296387 6.91888 0.296387 7.83284C0.296387 
            8.77702 1.52414 9.72428 3.19432 10.2993C3.32974 
            10.3447 3.46518 10.3901 3.60362 
            10.4294C3.55842 10.611 3.51934 10.7895 3.48324 
            10.9741C3.16727 12.6537 3.41402 13.9853 4.20245 
            14.4423C5.01495 14.9143 6.38113 14.4302 7.7112 
            13.259C7.81651 13.1652 7.92187 13.0683 8.02717 
            12.9654C8.15956 13.0955 8.29799 13.2196 8.43642 
            13.3407C9.72442 14.4543 10.9973 14.9053 11.7827 
            14.4483C12.5952 13.9762 12.8601 12.5448 12.517 
            10.8016C12.4899 10.6685 12.4598 10.5323 12.4267 
            10.3931C12.523 10.3658 12.6163 10.3356 12.7096 
            10.3053C14.4459 9.7273 15.7038 8.79219 15.7038 
            7.83284C15.7038 6.91586 14.5181 6.02614 12.8812 
            5.46022ZM8.80963 2.89088C9.92904 1.91037 
            10.9732 1.52599 11.4487 1.80145C11.9573 2.095 
            12.1529 3.28129 11.8339 4.83984C11.8128 4.94274 
            11.7918 5.04262 11.7647 5.14247C11.0975 4.99043 
            10.4209 4.88324 9.73947 4.82165C9.34859 4.25763 
            8.92033 3.72076 8.45757 3.21469C8.57491 3.10271 
            8.68922 2.99681 8.80963 2.89088ZM5.32791 
            9.40351C5.48139 9.66673 5.63784 9.93002 
            5.80335 10.1873C5.33437 10.136 4.8683 10.0602 
            4.40708 9.96031C4.54782 9.50336 4.71153 9.05387 
            4.89759 8.61364C5.03601 8.87995 5.17745 9.14324 
            5.32791 9.40351ZM4.41611 5.76285C4.84945 5.66596 
            5.30984 5.58727 5.78842 5.52676C5.62889 5.77796 
            5.47245 6.03521 5.32495 6.29548C5.17751 6.55272 
            5.03305 6.81601 4.89766 7.08232C4.70807 6.63142 
            4.54852 6.18952 4.41611 5.76285ZM5.24062 
            7.84795C5.4392 7.43035 5.65591 7.02176 5.88465 
            6.61927C6.11333 6.21678 6.36009 5.82638 6.61888 
            5.44208C7.07025 5.40878 7.5307 5.39059 8.00015 
            5.39059C8.46954 5.39059 8.93301 5.40878 9.38136 
            5.44208C9.63719 5.82336 9.88092 6.21376 10.1126 
            6.61322C10.3443 7.01269 10.562 7.42028 10.7657 
            7.83586C10.564 8.25346 10.3473 8.66508 10.1156 
            9.07059C9.88696 9.47308 9.64317 9.86348 9.38741 
            10.2509C8.93905 10.2841 8.47256 10.2993 8.00003 
            10.2993C7.52756 10.2993 7.07014 10.2841 6.62782 
            10.2569C6.36602 9.87254 6.11926 9.47912 5.88756 
            9.07663C5.65585 8.67414 5.44228 8.26561 5.24062 
            7.84795ZM10.6753 9.3974C10.8288 9.13109 10.9733 
            8.86176 11.1147 8.5894C11.3069 9.02727 11.4766 
            9.47473 11.6233 9.93002C11.1565 10.0365 10.6844 
            10.1173 10.2089 10.1722C10.3714 9.91793 10.5249 
            9.65767 10.6753 9.3974ZM11.1087 7.08232C10.9673 
            6.81601 10.8228 6.54964 10.6723 6.28937C10.5249 
            6.03219 10.3715 5.77796 10.2119 5.52676C10.6761 
            5.58395 11.1372 5.66478 11.5932 5.7689C11.4546 
            6.21488 11.2929 6.65328 11.1087 7.08232ZM8.00613 
            3.67772C8.32187 4.02279 8.61917 4.38444 8.89686 
            4.76112C8.30107 4.73388 7.70219 4.73388 7.1064 
            4.76112C7.40128 4.37073 7.70522 4.00758 8.00613 
            3.67772ZM4.51541 1.8226C5.02097 1.52602 6.14344 
            1.9497 7.32608 3.00285C7.40128 3.06943 7.47653 
            3.14207 7.55482 3.21469C7.08916 3.72064 6.65781 
            4.2575 6.26379 4.82165C5.58373 4.88269 4.90821 
            4.98781 4.24158 5.13636C4.20246 4.98204 4.16939 
            4.82468 4.13629 4.66731C3.85341 3.20259 4.03995 
            2.09799 4.51541 1.8226ZM3.77815 9.79989C3.65176 
            9.76356 3.52839 9.72427 3.405 9.6819C2.72348 
            9.47989 2.08202 9.16036 1.50918 8.73767C1.35892 
            8.63313 1.2313 8.49909 1.13406 8.34359C1.03682 
            8.18804 0.971972 8.01429 0.943439 7.83278C0.943439 
            7.279 1.89437 6.57079 3.26658 6.08961C3.43812 
            6.0291 3.61265 5.97465 3.78718 5.92321C3.99176 
            6.57998 4.23802 7.22288 4.52445 7.84795C4.23499 
            8.48214 3.98573 9.13399 3.77815 9.79989ZM7.28691 
            12.7657C6.79079 13.2231 6.21556 13.5851 5.58966 
            13.834C5.4248 13.9135 5.24536 13.9581 5.06261 
            13.9648C4.87987 13.9716 4.69768 13.9405 4.52742 
            13.8733C4.04894 13.5949 3.85033 12.5266 4.12118 
            11.0891C4.15427 10.9197 4.19039 10.7501 4.23252 
            10.5837C4.90606 10.7294 5.58877 10.8286 6.27576 
            10.8802C6.67375 11.4468 7.10806 11.9866 7.57579 
            12.4964C7.47956 12.5902 7.3832 12.6809 7.28691 
            12.7657ZM8.02415 12.0303C7.71725 11.6974 7.41028 
            11.3282 7.11239 10.9317C7.40128 10.9438 7.69917 
            10.9499 8.00009 10.9499C8.31002 10.9499 8.61402 
            10.9438 8.91499 10.9287C8.63813 11.3119 8.34071 
            11.6797 8.02415 12.0303ZM11.9573 12.9382C11.9434 
            13.1218 11.8922 13.3007 11.8068 13.4636C11.7214 
            13.6266 11.6036 13.7701 11.4608 13.8854C10.9823 
            14.1638 9.96216 13.8007 8.86077 12.8504C8.73437 
            12.7415 8.60797 12.6234 8.47861 12.5023C8.93852 
            11.9917 9.36282 11.4497 9.74848 10.8803C10.4391 
            10.8227 11.1249 10.7165 11.8008 10.5625C11.8309 
            10.6866 11.858 10.8107 11.882 10.9317C12.0289 
            11.5903 12.0544 12.2704 11.9573 12.9382ZM12.505 
            9.68487C12.4207 9.71213 12.3365 9.73939 12.2492 
            9.76356C12.037 9.1033 11.7807 8.45826 11.4818 
            7.83278C11.7695 7.21553 12.0158 6.57962 12.2191 
            5.92925C12.3756 5.9747 12.526 6.02306 12.6705 
            6.07148C14.0728 6.55568 15.0568 7.27598 15.0568 
            7.82673C15.0569 8.41992 14.0066 9.18555 12.505 
            9.68487ZM8.00009 9.23094C8.27268 9.23094 8.53917 
            9.14964 8.76584 8.99734C8.99245 8.84505 9.1691 
            8.62857 9.27345 8.3753C9.37775 8.12202 9.40501 
            7.84339 9.35185 7.57447C9.29864 7.30561 9.16738 
            7.05868 8.97467 6.86484C8.7819 6.671 8.53633 
            6.53897 8.26901 6.48552C8.00163 6.43201 7.72453 
            6.4595 7.47268 6.56439C7.22083 6.66928 7.0056 
            6.84694 6.85414 7.07485C6.70267 7.30276 6.62184 
            7.57079 6.62184 7.84493C6.62184 8.02691 6.65745 
            8.20718 6.72673 8.37536C6.79594 8.54353 6.89751 
            8.69636 7.02551 8.82507C7.15345 8.95379 7.30539 
            9.05583 7.47262 9.12552C7.63985 9.19515 7.81911 
            9.23094 8.00009 9.23094Z" fill="#56CCF2"/>
            </g>
            <defs>
            <clipPath id="clip0_2325_1891">
            <rect width="16" height="14.2222" fill="white" 
            transform="translate(0 0.888672)"/>
            </clipPath>
            </defs>
            </svg>
            Highcharts for React</div>`,
        demoDescription: '',
        chartDescription: `This demo shows how to use the Highcharts React
        integration to create a simple bubble chart. 
        The demo and code are purely decorative.`,
        madeWith: ['core']
    },
    areaRace: {
        run: areaRace,
        demoCardLabel: 'Area Chart Race',
        demoName: 'Area Chart Race',
        demoDescription: 'Animate data over time',
        chartDescription: `A purely decorative area chart that shows the 
        progression of revenue from the music industry over time. 
        The demo and code are purely decorative.`,
        madeWith: ['core']
    },
    liveData: {
        run: liveData,
        demoCardLabel: 'Live data from CSV',
        demoName: 'Live data from CSV',
        demoDescription: `Datasets formatted in CSV or 
        JSON can be fetched remotely using the data module.`,
        chartDescription: `A purely decorative area spline chart that shows 
        how to fetch remote data in CSV format.`,
        madeWith: ['core']
    },
    a11y: {
        run: a11y,
        demoCardLabel: 'Accessibility demo',
        demoName: 'Accessibility',
        demoDescription: `A purely decorative line chart 
        showcasing accessibility features of Highcharts.`,
        madeWith: ['core']
    },
    activity: {
        run: activity,
        demoCardLabel: 'Accessibility demo',
        demoName: 'Accessibility',
        demoDescription: `A purely decorative line chart 
        showcasing accessibility features of Highcharts.`,
        madeWith: ['core']
    }

};

Highcharts.setOptions({
    credits: {
        enabled: false
    },
    exporting: {
        enabled: false
    }
});


function buildDemo() {
    const chart = charts[chartToShow];

    if (chart.run === react) {
        codeContainer.classList.add('react');
        chartContainer.classList.add('react');
    } else {
        codeContainer.classList.remove('react');
        chartContainer.classList.remove('react');
    }

    if (chart.run === areaRace) {
        playControls.style.display = 'block';
    } else {
        playControls.style.display = 'none';
    }

    if (chart.run === liveData) {
        pollingControls.style.display = 'flex';
    } else {
        pollingControls.style.display = 'none';
    }

    // aria label for demo card
    demoCard.setAttribute('aria-label', chart.demoCardLabel);

    // demo title and subtitle
    demoName.innerHTML = chart.demoName;

    // demo description and a11y description
    demoDescription.innerHTML = chart.demoDescription;
    chartDescription.innerHTML = chart.chartDescription;

    // made with buttons
    let buttonString = '';
    for (let ii = 0; ii < chart.madeWith.length; ++ii) {
        const product = productInfo[chart.madeWith[ii]];
        buttonString +=  `<a href="${product.url}" 
        target="_blank" class="hc-button hc-button--white hc-button--size-100">
        ${product.name}`;
        if (product.icon.indexOf('highcharts.com') !== -1) {
            // eslint-disable-next-line max-len
            buttonString += `<img src="${product.icon}" height="12" width="12"></a>`;
        } else {
            buttonString += product.icon;
        }
    }

    productButtons.innerHTML = buttonString;

    // show chart
    chart.run();
}


buildDemo();