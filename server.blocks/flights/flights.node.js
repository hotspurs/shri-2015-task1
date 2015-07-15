modules.define('flights', function(provide){

	var flights = {},
		request = require('request'),
    	vow = require('../../libs/bem-core/common.blocks/vow/vow.vanilla.js');


    function getRandomInt(min, max){
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function prepareData(data, type, now){
    	var arr = [];

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

    	arr = data.map(function(item){
    		return {
    		    type : type,
    		    number : item.number,
    		    company : item.company,
    		    aircraft : item.aircraft_type_code,
    		    airport : item.airport,
    		    time : type === 'arr' ? item.arrival_time.scheduled : item.departure_time.scheduled,
    		    status : item.status ? item.status : statuses[type][ getRandomInt(0,4) ],
    		    note : 'Share code'
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
                return Date(a.time) - Date(b.time);
            });            

            dfd.resolve(data);
		});
		return dfd.promise();
	}

	provide(flights)

});