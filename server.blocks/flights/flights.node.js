modules.define('flights', function(provide){

    var flights = {},
        request = require('request'),
        vow = require('../../libs/bem-core/common.blocks/vow/vow.vanilla.js'),
        statuses = {
                    arr : ['По расписанию',
                           'Летит',
                           'Приземлился',
                           'Отменён',
                           'Задерживается до'
                           ],
                    dep : [
                           'По расписанию',
                           'Регистрация',
                           'Ожидание посадки',
                           'Идет посадка',
                           'Посадка закончена',
                           'Вылетел',
                           'Отменён',
                           'Задерживается до']
        };

    function getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function prepareTime(number){
        if(number < 10) return '0'+number;
        else return number;
    }

    function prepareTimeForUser(data){
        data.forEach(function(elem, index){
            var shortTime = elem.time.split(" ")[1].split(":");
            elem.time = shortTime[0] +':'+ shortTime[1];
        });
        return data;
    }


    function setStatus(flight, type, timestampNow){
        var counterBegin,
            counterEnd,
            boardingBegin,
            boardingEnd,
            depTime,
            arrTime,
            randomIntTime,
            randomIntStatuses,
            randomTimes,
            randomTime,
            randomStatusesDepart,
            randomStatusesArrived;


        if(type == 'dep'){
            counterBegin = +new Date( (flight.counter.begin && flight.counter.begin.actual) ? flight.counter.begin.actual : flight.counter.begin.plan );
            counterEnd = +new Date( flight.counter.end.actual ? flight.counter.end.actual : flight.counter.end.plan );
            boardingBegin = +new Date( flight.boarding.begin.actual ? flight.boarding.begin.actual : flight.boarding.begin.plan );
            boardingEnd = +new Date( flight.boarding.end.actual ? flight.boarding.end.actual : flight.boarding.end.plan );
            depTime = +new Date( flight.date );

            if(flight.status && flight.status === "Отправлен") return statuses.dep[5]; //Вылетел

            if(flight.status && flight.status === "Отменён") return statuses.dep[6]; //Отменён

            if(timestampNow < counterBegin) return statuses.dep[0]; // Регистрация еще не началась

            if( (timestampNow >=  counterBegin)  && (timestampNow <=  counterEnd) ) return statuses.dep[1]+' '+flight.counters; // Идет регистрация

            if( (timestampNow > counterEnd) && (timestampNow <  boardingBegin) ) return statuses.dep[2]; // Ожидание посадки

            if( (timestampNow >=  boardingBegin)  && (timestampNow <=  boardingEnd) ) return statuses.dep[3];// Идет посадка

            if( (timestampNow > boardingEnd)  &&  (timestampNow < depTime) ) return statuses.dep[4]; //Посадка закончена


            randomIntTime = getRandomInt(0,2);
            randomIntStatuses = getRandomInt(0,2);
            randomTimes = [1000*60*10, 1000*60*15, 1000*60*30];
            randomTime = new Date(timestampNow + randomTimes[randomIntTime]);
            randomStatusesDepart = ['Вылетел', 'Отменён', 'Задерживается до\&nbsp;'+prepareTime(randomTime.getHours())+'\&nbsp;:\&nbsp;'+prepareTime(randomTime.getMinutes()) ];

            return randomStatusesDepart[randomIntStatuses];

        }
        else{
            depTime = +new Date( (flight.departure_time && flight.departure_time.origin) ? flight.departure_time.origin : null );
            arrTime = +new Date( flight.date );

            if(flight.status && flight.status === "Прибыл") return statuses.arr[2]; //Приземлился

            if(flight.status && flight.status === "Отменён") return statuses.arr[3]; //Отменён

            if( (depTime &&  timestampNow >= depTime) && (timestampNow < arrTime ) ) return statuses.arr[1];

            randomIntTime = getRandomInt(0,2);
            randomIntStatuses = getRandomInt(0,2);
            randomTimes = [1000*60*60*2, 1000*60*60*3, 1000*60*60*4];
            randomTime = new Date(timestampNow + randomTimes[randomIntTime]);
            randomStatusesArrived = ['По расписанию', 'Отменён', 'Задерживается до\&nbsp;'+prepareTime(randomTime.getHours())+'\&nbsp;:\&nbsp;'+prepareTime(randomTime.getMinutes()) ];
            return randomStatusesArrived[randomIntStatuses];

        }
    }

    var companyhasLogo = {
        'lufthansa' : 'logo/lufthansa.png',
        'аэрофлот' : 'logo/afl.png',
        'россия'   : 'logo/russian.png',
        'трансаэро' : 'logo/transaero.png',
        'нордавиа' : 'logo/nordavia.png',
        's7' : 'logo/s7.png',
        'ямал' : 'logo/yamal.png'
    };

    function getLogo(company){
        var hasLogo = companyhasLogo[company.toLowerCase()];
        if(hasLogo) return hasLogo;

        return 'logo/default.png';
    }

    function prepareData(data, type, now){
    	var arr = [],
            timestampNow = +new Date(now),
            twoHourAgo = timestampNow - ( 1000*60*60*2 ),
            twoHourForward = timestampNow + ( 1000*60*60*2 );

        data.forEach(function(item, index){
    	    var flight = {
    		    type : type,
    		    number : item.number,
    		    company : item.company,
    		    aircraft : item.aircraft_type_code,
                counters : item.counters,
    		    airport : item.airport,
    		    time : item.date,
    		    status : setStatus(item, type, timestampNow),
    		    note : 'Код-шеринг (код авиакомпании-оператора/код авиакомпании-партнера)',
                logo : getLogo(item.company)
    		},
            time = +new Date(flight.time);

            if( (time >= twoHourAgo) && (time <= twoHourForward) )  arr.push(flight);

    	});

        return arr;
    }

    flights.get = function(type, day){
        var dfd = vow.defer(),
            data;

		request({ url : 'http://www.pulkovoairport.ru/f/flights/cur/ru_'+type+'_'+day+'.js', json : true}, function(error, res, body){
			if(error){
                dfd.reject('');
			}
			else{
                data = prepareData( body.data, type, body.now );
                dfd.resolve(data);
            }
		});

		return dfd.promise();
    };

    flights.getAll = function(){
		var data = [],
		    dfd = vow.defer();
        vow.all([flights.get('arr',1), flights.get('dep',1)])
        .then(function(results){

            Object.keys(results).map(function(idx) {
                data = data.concat(results[idx]);
            });

            data.sort(function(a, b) {
                return  ( +new Date(a.time) - +new Date(b.time) );
            });

            data = prepareTimeForUser(data);
            dfd.resolve(data);
		});
        return dfd.promise();
    };

	provide(flights);

});
