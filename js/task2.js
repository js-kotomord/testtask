/*
Пусть размер каждого входного массива - N
Тогда размер выходного массива - O(N^3),  таким образом, сложность  алгоритма не меньше чем
 O(N^3).

Ниже будет упомянута часть константных оптимизаций, которые я не стал реализовывать,
чтобы не раздувать код. (выигрыш с них, скорее всего, невелик.
*/
//Функция, возвращающая стоимость массива 3*3
//Вычислительная сложность - константа
function getCost(square) {
    var cost = 0;
    for (var i = 0; i < 3; ++i) {
        if (square[i][0] == square[i][1] && square[i][0] == square[i][2]) cost += square[i][0];
        if (square[0][i] == square[1][i] && square[0][i] == square[2][i]) cost += square[0][i];
    }
    if (square[0][0] == square[1][1] && square[0][0] == square[2][2]) cost += square[0][0];
    if (square[0][2] == square[1][1] && square[0][2] == square[2][0]) cost += square[0][2];
    return cost;
}

//Проверка getCost
// еще немного погонял руками
function costTest() {
    if (getCost([
            [5, 0, 5],
            [5, 5, 5],
            [5, 0, 5]
        ]) !== 25) return false;

    if (getCost([
            [5, 0, 0],
            [0, 5, 0],
            [5, 0, 0]
        ]) !== 0) return false;
    if (getCost([
            [1, 2, 3],
            [4, 5, 6],
            [9, 8, 7]
        ]) !== 0) return false;

    if (getCost([
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ]) !== 8) return false;


    if (getCost([
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3]
        ]) !== 6) return false;
    return true;
}

// собственно, требуемая функция
function getCostDistribution(first, second, third) {
    if (!Array.isArray(first) || !Array.isArray(second) || !Array.isArray(third)) {
        throw "parameter must be an array";
    }
    if (first.length != second.length || first.length != second.length) {
        throw "incompatible lengths";
    }

    //Закольцованность - больше чем к нулевому и первому элементу массива мы "через край" не обратимся, поэтому просто
    //добавим их в конец массива
    // Это даст небольшую оптимизацию - мы избавимся от проверок, нужно ли нам переходить через край
    //или достаточно простой адресации
    var size = first.length;
    first.push(first[0]);
    first.push(first[1]);
    second.push(second[0]);
    second.push(second[1]);
    third.push(third[0]);
    third.push(third[1]);

    var accum = {};
    var state = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    //Простой перебор состояний
    for (var i = 0; i < size; ++i) {
        state[0][0] = first[i];
        state[1][0] = first[i + 1];
        state[2][0] = first[i + 2];
        for (var j = 0; j < size; ++j) {
            state[0][1] = second[j];
            state[1][1] = second[j + 1];
            state[2][1] = second[j + 2];
            for (var k = 0; k < size; ++k) {
                state[0][2] = third[k];
                state[1][2] = third[k + 1];
                state[2][2] = third[k + 2];
                //Отдельно - ставил здесь точку останова и проверял, что отступ определен именно
                // так - из тестового задания это сходу не понять


                var cost = getCost(state);

                //Здесь есть недостаток -очки за вертикали можно не считать каждый раз в getCost(),
                //а закэшировать как функции от i, j и k соответственно
                // Но это константное ускорение (меньше чем в 2 раза), которое раздует код - решил пока не делать

                if (accum[cost] == undefined) accum[cost] = [];
                accum[cost].push([i, j, k]);
            }
        }
    }
    /*
       Не забыть удалить добавленные в конец массивов элементы

    */
    first.pop();
    first.pop();
    second.pop();
    second.pop();
    third.pop();
    third.pop();

    return accum;
}

/*
Проверка
*/

var a1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
var a2 = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
var a3 = [5, 4, 3, 2, 1, 0, 1, 2, 3, 4];

console.log(getCostDistribution(a1, a2, a3));
console.log(a1.length);

/*
В принципе, в случае клиента возможна интересная оптимизация - выполнение в параллельном режиме на WebWorker'ах
В итоге мы получим несколько (по числу потоков) массивов accum, которые останется слить в один результирующий.
*/
