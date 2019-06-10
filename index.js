$(document).ready(function () {
    var $drags = $('.wid').draggable({
        scroll: false
    }, {
        containment: "#droppable"
    }, {
        cursor: 'move'
    }, {
        start: function () {
            //fica opaco
            $(this).animate({
                opacity: '0.5'
            }, 500);
            console.log('evento start')
        },
        drag: function () {

            console.log('evento drag')
        },
        stop: function () {
            $(this).animate({
                opacity: '1'
            }, 500);
        }
    });

    var $drops = $('#droppable').droppable({
        over: function () {
            $(this).css({
                border: 'dashed 5px salmon'
            });
        },
        drop: function () {
            $(this).css({
                border: 0
            });
        }
    });

    pegaHoraDia();
    pegaLocalizacao();
});

function pegaHoraDia() {
    var $horas = $('#horas'),
        $minutos = $('#minutos'),
        $segundos = $('#segundos');
    $dias = $(".dias")

    var data = new Date();

    var $diaAtual = $('#' + data.getDay());

    $diaAtual.addClass('diaAtual');

    var horas = data.getHours() < 10 ?
        '0' + data.getHours() :
        data.getHours();

    var minutos = data.getMinutes() < 10 ?
        '0' + data.getMinutes() :
        data.getMinutes();

    var segundos = data.getSeconds() < 10 ?
        '0' + data.getSeconds() :
        data.getSeconds();

    $horas.text(horas);
    $minutos.text(minutos);
    $segundos.text(segundos);
}

function enviaPosicao(posicao) {
    var lat = posicao.coords.latitude;
    var long = posicao.coords.longitude;
    pegaClima(lat, long);
}

function pegaClima(lat, long) {
    var PROXY = 'https://cors-anywhere.herokuapp.com/';
    var URL_CIDADE = 'https://www.metaweather.com/api/location/search/?lattlong=' + lat + ',' + long;

    /* Pegar cidade */
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        type: 'GET',
        url: PROXY + URL_CIDADE,
        dataType: 'json',
        crossDomain: true,  
        success: function (dataLoc) {
            var whereOnEarth = dataLoc[0].woeid;
            console.log('1: ' + whereOnEarth);

            /* Pegar clima */
            var URL_CLIMA = 'https://www.metaweather.com/api/location/' + whereOnEarth + '/';
            $.ajax({
                type: 'GET',
                url: PROXY + URL_CLIMA,
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                  },
                success: function (dataClima) {
                    /* console.log('dado clima:\nCidade -  ' + dataClima.title + '\nClima: ' +
                        dataClima.consolidated_weather[0].weather_state_name); */
                    var local = dataClima.title;
                    var nomeClima = dataClima.consolidated_weather[0].weather_state_name;
                    var abbrClima = dataClima.consolidated_weather[0].weather_state_abbr;
                    var minTemp = dataClima.consolidated_weather[0].min_temp;
                    var maxTemp = dataClima.consolidated_weather[0].max_temp;
                    var temp = Math.round((minTemp + maxTemp) / 2);
                    //var timeZone = dataClima.timezone_name;
                    /* Mandar pra view */
                    widgetTermometroUI(nomeClima, abbrClima, temp, local);
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function pegaLocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(enviaPosicao);
    } else {
        console.log('Erro ao pegar posição') // Mandar erros pra tela 
    }
}

/* Monta view do wid termômetro */

function widgetTermometroUI(nomeClima, abbrClima, temp, local) {

    $('#iclima').attr('src', 'https://www.metaweather.com/static/img/weather/png/' + abbrClima + '.png');

    $('#temp').append('<p>' + local + ' - ' + temp + '°' + '</p>');

    $('#nomeClima').append('<p>' + nomeClima + '</p>');

}