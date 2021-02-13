$(document).ready(function () {

    const togglesArray = [];
    const symbolArr = [];
    let paddingCoin = '';

    getCoinDivData();
    search();

    //===========================================

    var dataPoints = [{}];

    var chart = new CanvasJS.Chart("chartContainer", {
        zoomEnabled: true,
        title: {
            text: "Live crypto currency prices",
            fontSize: 20,
            fontColor: '#334466',
            fontFamily: 'Montserrat',
            FontWeight: "bold",
            margin: 13
        },
        axisX: {
            title: "chart updates every 2 secs",
            labelFontSize: 14,
            labelFontColor: '#334466',
            labelFontFamily: 'Montserrat',
            labelFontWeight: "bold",
            labelAngle: -30,
            gridColor: "#334466",
            titleFontSize: 14,
            titleFontColor: `#334466`,
            titleFontFamily: 'Montserrat',
        },
        axisY: {
            prefix: "$",
            includeZero: false,
            labelFontSize: 14,
            labelFontColor: '#334466',
            labelFontFamily: 'Montserrat',
            labelFontWeight: "bold",
            labelAngle: -30,
            gridColor: "#334466",
            titleFontSize: 14,
            titleFontColor: `#334466`,
            titleFontFamily: 'Montserrat',
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "top",
            fontSize: 15,
            fontColor: `#334466`,
            fontFamily: 'Montserrat',
            itemclick: toggleDataSeries
        },
        data: []
    });

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

    var updateInterval = 2000;
    var time = new Date;
    time.setHours(time.getHours());
    time.setMinutes(time.getMinutes());
    time.setSeconds(time.getSeconds());


    function updateChart(count) {
        {
            if (togglesArray.length !== 0) {
                $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${togglesArray.toString()}&tsyms=USD&api_key=85d7a7b0e09b7b67489a0c793aa91823f18e2cea8da0252c7a4e7beae7bf623c`).then(data => {
                    count = count || 1;

                    for (var i = 0; i < count; i++) {
                        time.setTime(time.getTime() + updateInterval);
                     
                        for (let i = 0; i < togglesArray.length; i++) {
                            
                            if (dataPoints[0][togglesArray[i]].length === 50) {
                                dataPoints[0][togglesArray[i]].shift()
                            }
                            dataPoints[0][togglesArray[i]].push({
                                x: time.getTime(),
                                y: data[Object.keys(data)[i]].USD
                            });

                            
                            chart.options.data[i].legendText = `${togglesArray[i]} $` + data[Object.keys(data)[i]].USD;
                        }
                    }
                    chart.render();
                });
            }
        }
    }

    function startInterval(){
        if(interval == null){
            isChartNeedsUpdate = true;
            
            addCoinsToChart();
            updateChart();
            interval = setInterval(function () {
                addCoinsToChart();
                updateChart();
            }, updateInterval);
        }
    }

    var interval = null;

    $('.tab').on('click', function () {
       
        clearInterval(interval);
        interval = null;
        for(let i=0;i<togglesArray.length;i++){
            dataPoints[0][togglesArray[i]]=[];
        }
    });

    $('#live').on('click', function () {

        if (togglesArray.length !== 0) {
            startInterval();
            $('#liveReportHL').hide();
            $('#chartContainer').show();
        } else {
            $('#chartContainer').hide();
            $('#liveReportHL').show();
        }

    });

    let isChartNeedsUpdate = true;

    function addCoinsToChart() {
        if (isChartNeedsUpdate === true) {
            chart.options.data = [];
            for (let i = 0; i < togglesArray.length; i++) {
                chart.options.data.push({
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "$####.00",
                    xValueFormatString: "hh:mm:ss TT",
                    showInLegend: true,
                    name: togglesArray[i],
                    dataPoints: dataPoints[0][Object.keys(dataPoints[0])[i]]
                });
            }
        }
        isChartNeedsUpdate = false
    }

    //===========================

    function getCoinDivData() {
        $.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false
`).then(data => {
            createCoinDiv(data)
        });
    }

    function createCoinDiv(data) {
        $(`.preloader`).hide();
        for (let i = 0; i < 100; i++) {
            $(`#coinsContainer`).append(`${coinDiv(data[i])}`).hide().fadeIn(500);
            createSymbolArr(data[i])
        }
        getTheButtons();
        getTheToggles();
    }


    function createSymbolArr(coinData) {
       
        symbolArr.push(coinData.symbol);
    }

    function coinDiv(coinData) {
        return (`<div class="${coinData.name.split(" ").join("-")} coin col-xl-4 col-lg-4 col-md-4 col-sm-12" id="${coinData.id.toLowerCase()}"><label class="switch"><input type="checkbox" class="checkBoxField ${coinData.symbol.toUpperCase()}Toggle"><span class="slider round"></span></label><p class="symbol">${(coinData.symbol).toUpperCase()}</p><p>${coinData.name}</p><input type="button" value="More Info" class="${coinData.name.toLowerCase()} btn btn-primary btn-sm"><div class="loaderDiv"><div class="loader ${coinData.name}loader"></div></div><div id="${coinData.id.split(" ").join("-").toLowerCase()}moreInfo" class="moreInfoDiv"></div></div></div>`)
    }


    function getTheToggles() {
        
        $(`.checkBoxField`).on('change', function (e) {

            let coinId = e.target.parentElement.nextElementSibling.innerHTML;

            if (togglesArray.length === 5 && togglesArray.includes(coinId) === false) {
                paddingCoin = coinId;
                this.checked = false;
                $("#myModal").modal();
                return
            }
            if (this.checked) {
                toggleArrayAdder(coinId);
                isChartNeedsUpdate = true
            } else {
                toggleArrayRemover(coinId);
                isChartNeedsUpdate = true
            }
        })
    }

    function syncAllToggles(coinToRemove) {
        
        if (coinToRemove !== undefined) {
            
            $(`.${coinToRemove}Toggle`).each(function () {
                this.checked = false
            })
        }
        for (let i = 0; i < togglesArray.length; i++) {
            $(`.${togglesArray[i]}Toggle`).each(function () {
                this.checked = true
            })
        }
    }

    function ModalToggles(coinName) {
        
        $(`#${coinName}Modal`).on(`change`, function () {
            toggleArrayRemover(coinName);
            $("#myModal").modal('hide');

            if (paddingCoin !== '') {
                toggleArrayAdder(paddingCoin);
            }
            paddingCoin = '';
        })
    }

    function toggleArrayAdder(coinName) {
        if (togglesArray.includes(coinName)) {
            return
        }
        togglesArray.push(coinName);
        createModal();
        syncAllToggles();

        dataPoints[0][coinName] = [];
    }

    function toggleArrayRemover(coinName) {
        if (togglesArray.includes(coinName)) {
            togglesArray.splice(togglesArray.indexOf(coinName), 1);
            createModal();
            syncAllToggles(coinName);
            delete dataPoints[0][coinName]

        }
    }

    function createModal() {
        $(`.modal-body`).empty();
        for (let i = 0; i < togglesArray.length; i++) {
            $(`.modal-body`).append(`<div class="modalToggleDiv col-12"><label class="switch"><input type="checkbox" checked class="checkBoxField ToggleModal ${togglesArray[i]}Toggle" id="${togglesArray[i]}Modal"><span class="slider round"></span></label><p class="symbolToggle">${(togglesArray[i]).toUpperCase()}</p></div>`);
            ModalToggles(togglesArray[i]);
        }
    }

    function search() {

        $(`#formInput`).on('submit', function (e) {
            e.preventDefault();
        });
        $("#inputForm").on("keyup", function (e) {
            e.preventDefault();

            var value = $(this).val().toLowerCase();
            if (symbolArr.includes(value)) {
                $("#coinsContainer div:not('.moreInfoDiv'):not('.moreInfo'):not('.loaderDiv'):not('.loader')").filter(function () {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            } else {
                $("#coinsContainer div:not('.moreInfoDiv'):not('.moreInfo'):not('.loaderDiv'):not('.loader')").filter(function () {
                    $(this).toggle($(this).text().toLowerCase().indexOf('') > -1)
                });
            }
        });
    }


    function createMoreInfoDiv(data) {
        $(`.${data.name}loader`).toggle();
        $(`#${data.id.split(" ").join("-").toLowerCase()}moreInfo`).append(`<img class="thumb " src ="${data.image.thumb}"/><div class ="moreInfo"><span class="currencySymbol">USD</span><span class="currency">${data.market_data.current_price.usd.toFixed(2)}$</span><span class="currencySymbol">EUR</span><span class="currency">${data.market_data.current_price.eur.toFixed(2)}€</span><span class="currencySymbol">ILS</span><span class="currency">${data.market_data.current_price.ils.toFixed(2)}₪</span></div>`)
    }


    function getTheButtons() {
        

        $(`.btn`).on('click', function (e) {
           
            if ($(e.target.parentElement).css("height") === '220px') {
                $(`#${e.target.parentElement.id}moreInfo`).empty();
                $(`#${e.target.parentElement.id}`).animate({
                    height: '-=100px'
                }, 600);

            } else if ($(e.target.parentElement).css("height") === '120px') {
                $(`#${e.target.parentElement.id}`).animate({
                    height: '+=100px'
                }, 600);
                getCoinMoreInfoData(e.target.parentElement.id);
                $(`.${e.target.parentElement.classList[0]}loader`).toggle();
            }
        });
    }

    function getCoinMoreInfoData(coinName) {
        

        if (readLocalStorage(coinName) !== null) {
            let localStorageTime = readLocalStorage(coinName)[0].time;
            if (120000 + localStorageTime < new Date().getTime()) {
                //data storage is old,sending data from api
                getMoreInfoDataApi(coinName)
            } else {
                //sending data from local storage
                createMoreInfoDiv(readLocalStorage(coinName)[1])
            }
        } else if (readLocalStorage(coinName) == null) {
            //data storage is empty,sending data from api
            getMoreInfoDataApi(coinName)
        }
    }

    function getMoreInfoDataApi(coinName) {
        
        $.get(`https://api.coingecko.com/api/v3/coins/${coinName}`).then(data => {
            let toStorage = [{time: new Date().getTime()}, (data)];
            createMoreInfoDiv(data);
            writeLocalStorage(coinName, JSON.stringify(toStorage));
        });
    }

    function writeLocalStorage(coinName, data) {
        return window.localStorage.setItem(coinName, data);
    }

    function readLocalStorage(coinName) {
        return JSON.parse(window.localStorage.getItem(coinName))
    }

});