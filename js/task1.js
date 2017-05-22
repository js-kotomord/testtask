/*
Задание 1. 
Распределение полагаем javascript - объектом одной из двух структур:
1. Содержит поле lastCall, являющееся функцией, реализующей некоторое распределение

2. Содержит поле firstCall, являющееся функцией, реализующей дискретное распределение на натуральные числа от 0 до k-1,
и поле nextCalls, являющееся массивом длины k объектов-распределений типа (1) или (2)

Сама функция в таком случае реализуется тривиально
*/


function runDistribution(dist) {
    if (dist.lastCall != undefined) return dist.lastCall();
    if (dist.firstCall != undefined)
        return runDistribution(dist.nextCalls[dist.firstCall()]);
    throw "Not a distribution object";
}

/*
 Отдельно реализуем примитивы - набор функций, которые по параметрам распределения возвращают функцию,  реализующую 
 данное  распределение.  
 
 Расширяемо, пока реализованы только распределения, указанные в ТЗ. 
 Дискретное распределение -  константа вынесена отдельно. Также - для того, чтобы задать какому-то распределению 
 ограничения на значение, нужно создать функцию, реализующую  распределение без  ограничений, и вызывать
 distributionUtils.bound(func, from, to);
*/

var distributionUtils = {
    //дискретное распределение с одним значением
    //реализовал отдельно ради сокращение кода впоследствии
    point: function(value) {
        return function() {
            return value;
        };
    },
    //Дискретное распределение - первый массив - вероятности, второй - значения
    //Если опустить второй параметр, будет использоваться массив последовательных целых от 0
    discrete: function(probArray, valArray) {
        if (!Array.isArray(probArray)) throw "discrete: parameter must be an array";
        var first = probArray;
        var second = [];
        if (valArray != undefined) {
            if (!Array.isArray(valArray)) throw "discrete: parameter must be an array";
            second = valArray;
        } else {
            for (var i = 0; i < probArray.length; ++i) {
                second.push(i);
            }
        }
        if (first.length != second.length) {
            throw "discrete: parameter lengths must be equals";
        }

        //Исключительные ситуации "в массивах лежат не числа" и "сумма вероятностей не равна 1" не проверяю,
        //проверку можно добавить сюда
        return function() {
            var sum = 0;
            var rand = Math.random();
            for (var i = 0; i < first.length; ++i) {
                sum += first[i];
                if (sum >= rand) return second[i];
            }
            return second[first.length - 1];
        }
    },
    //равномерное, входные параметры - начало и конец отрезка
    uniformly: function(from, to) {
        return function() {
            return from + (to - from) * Math.random();
        }
    },

    //Первый параметр - функция распределения, второй и третий - ограничения на результат сверху и снизу
    bound: function(f, from, to) {
        return function() {
            for (;;) {
                var ret = f();
                if (ret < from) continue;
                if (ret > to) continue;
                return ret;
            }
        }
    },
    //Метод Бокса-Мюллера, для простоты реализации - второе значение сразу отбрасываю
    //Входные параметры - матожидание и среднеквадратичное отклонение
    gaussian: function(mean, dev) {
        mean = mean == undefined ? 0.0 : mean;
        dev = dev == undefined ? 1.0 : dev;
        return function() {
            for (;;) {
                var u = 2.0 * Math.random() - 1.0;
                var v = 2.0 * Math.random() - 1.0;
                var s = u * u + v * v;
                if (s > 1.0) continue;
                if (s == 0.0) continue;
                var r = Math.sqrt(-2.0 * Math.log(s) / s);
                return r * v * dev + mean;
            }
        }
    },

    //Экспоненциальное распределение, тут все просто
    exponential: function(lambda) {
        lambda = lambda == undefined ? 1.0 : lambda;
        return function() {
            for (;;) {
                var u = Math.random();
                if (u == 0.0) continue;
                return -Math.log(u) / lambda;
            }
        }
    }


}


/*
  распределения теперь легко создаются декларативно
*/

var distributionFirst = { //Дискретное распределение и точка - уровень вложенности 2.
    firstCall: distributionUtils.discrete([0.2, 0.3, 0.5]),
    nextCalls: [{
            lastCall: distributionUtils.point(0)
        },
        {
            lastCall: distributionUtils.point(1)
        },
        {
            lastCall: distributionUtils.discrete([0.5, 0.5], [7, 8])
        }
    ]
};


var distributionBound = { // Равномерное распределение и расп
    lastCall: distributionUtils.bound(distributionUtils.uniformly(1, 5), 2, 3)
};

var distributionTask = { //Распределение из тестового задания
    firstCall: distributionUtils.discrete([0.7, 0.25, 0.05]),
    nextCalls: [{
            lastCall: distributionUtils.point(0)
        },
        {
            lastCall: distributionUtils.bound(distributionUtils.gaussian(1, 0.3), 0.5, 1.5)
        },
        {
            lastCall: distributionUtils.uniformly(2, 5)
        }
    ]
};


var distributionBig = { // распределение вложенности 3, содержащее все реализованные простые распределения
    firstCall: distributionUtils.discrete([0.7, 0.25, 0.05]),
    nextCalls: [{
            firstCall: distributionUtils.discrete([0.7, 0.25, 0.05]),
            nextCalls: [{
                    lastCall: distributionUtils.point(1)
                },
                {
                    lastCall: distributionUtils.exponential(2)
                },
                {
                    lastCall: distributionUtils.discrete([0.4, 0.6], [7, 8])
                }
            ]
        },
        {
            lastCall: distributionUtils.bound(distributionUtils.gaussian(1, 0.3), 0.5, 1.5)
        },
        {
            lastCall: distributionUtils.uniformly(2, 5)
        }
    ]
};

/*
Тестирование - вывод в консоль некоторого числа попыток, чтобы глазами убедиться, что распределение примерно такое,
которое мы задали
*/

function testDistribution(distr, count) {
    for (var i = 0; i < count; ++i) {
        console.log(runDistribution(distr));
    }
}



testDistribution(distributionBig, 1000);