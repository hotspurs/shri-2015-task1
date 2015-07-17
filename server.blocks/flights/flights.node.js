modules.define('flights', function(provide){

	var flights = {},
		request = require('request'),
    	vow = require('../../libs/bem-core/common.blocks/vow/vow.vanilla.js');


    function getRandomInt(min, max){
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function prepareTimeForUser(data){
        data.forEach(function(elem, index){
            var shortTime = elem.time.split(" ")[1].split(":");
            elem.time = shortTime[0] +':'+ shortTime[1];
        })

        return data;     
    }


    function checkStatus(flight, now){

        if(flight.status) return flight.status;

        return '';

    }

    function prepareData(data, type, now){
    	var arr = [],
            timestamp = +new Date(now),
            hourAgo = timestamp - ( 1000*60*60*2 ),
            hourForward = timestamp + ( 1000*60*60*2 );

    	var statuses = {
    					arr : ['По расписанию', 
    					   'Летит', 
    					   'Приземлился',
    					   'Отменён',
    					   'Летит'
    					   ],
    					dep : ['Регистрация', 
    					   'Ожидание посадки', 
    					   'Посадка закончена',
    					   'Вылетел',
    					   'Отменён']
    					};

    	data.forEach(function(item, index){




    		var flight = {
    		    type : type,
    		    number : item.number,
    		    company : item.company,
    		    aircraft : item.aircraft_type_code,
    		    airport : item.airport,
    		    time : item.date,
    		    status : checkStatus(item, now),
    		    note : 'Share code'
    		},
            time = +new Date(flight.time);



            if(  (time >= hourAgo) && (time <= hourForward ) ){
                arr.push(flight);
            }

    	});

    	return arr;
    }


    flights.get = function(type, day){
		var dfd = vow.defer(),
		    data;

		request({ url : 'http://www.pulkovoairport.ru/f/flights/cur/ru_'+type+'_'+day+'.js',
	              json : true}, function(error, res, body){
			if(error){
				dfd.reject('');
			}
			else{
				data = prepareData( body.data, type, body.now );
				dfd.resolve(data);
			}
		});

		return dfd.promise();
	}

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
	}

	provide(flights)

});