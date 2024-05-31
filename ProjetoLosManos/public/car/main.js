const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

// console.log(typeof localStorage.getItem("bestBrain")) 
document.querySelector("body").ondblclick = () => {
    if(confirm("Deseja restaurar o carro funcional?")) {
        localStorage.setItem("bestBrain", `{"levels":[{"inputs":[0.35758267018825174,0.29585028861055573,0.19389549134283413,0.022695302284490904,0],"outputs":[0,1,1,0,0,0],"biases":[-0.020857590196097495,0.01234204885412826,-0.03532093425325265,0.1749271623777799,0.05273083853250386,0.05025072084511305],"weights":[[0.030522513858521956,0.1388665774509984,-0.0429336347581416,-0.04211112606103874,-0.06607623426388079,-0.04696640908246539],[-0.05986397569661342,0.23106715053706856,0.04872839910660003,0.06634013860048789,-0.10557617337781094,-0.32872559228924275],[-0.07265459890070831,0.10360937712772769,0.17067426259454904,0.030820626170535576,-0.1667031037496667,0.05580970707718916],[-0.17956311161830504,0.05628039183588913,0.24404779956468794,-0.10141561063303867,-0.03700263659445693,0.0023514327415142533],[0.019655648475635168,-0.09593868375254169,0.25128038705693045,0.03825071316462616,0.04664888963642927,0.1500559923135921]]},{"inputs":[0,1,1,0,0,0],"outputs":[1,0,1,0],"biases":[-0.19784136576495792,0.10948238575414479,-0.006284141366539211,0.04417556355970281],"weights":[[0.015045951562018166,0.07660937057220679,-0.15724157688172757,-0.11759374462779817],[0.007859261421424117,-0.33072866902054765,0.19402720063253945,-0.041023097443141726],[0.1705066963320839,0.10202574591697099,-0.13113168260136504,-0.13607622755801074],[-0.15629009185313714,-0.09791166326278991,0.051547459492265114,0.018848125285875317],[0.169380316561493,0.014526359497451447,-0.03403860569999184,-0.03988835464403555],[-0.2713563912256644,-0.09551575062005097,-0.012764533091586882,-0.3480913372395746]]}]}`)
    }
}

const N=500;
const cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}


const traffic=[];
let km = -100
const randomTraffic = () => {
    const numCarsCurrent = Math.floor(Math.random() * 2) + 1;
    let pos = (Math.floor(Math.random() * 3) + 1) - 1;
    let posT = (Math.floor(Math.random() * 2) + 1);

    if(numCarsCurrent == 2) {
        if(pos == 2) {
            pos = [pos, pos - 1]
        }
        else if(pos == 0) {
            pos = [pos, pos + 1]
        }
        else {
             if(posT == 2) {
                pos = [pos, pos - 1]
             }
             else {
                pos = [pos, pos + 1]
             }
        }
    }
    else {
        pos = [pos]
    }

    for(let i = 0; i <= numCarsCurrent; i++) {
        
        const car = new Car(road.getLaneCenter(pos[i]),km,30,50,"DUMMY",2,getRandomColor())
        traffic.push(car)
    }
    km -= 500
}
randomTraffic()

setInterval(() => {
    randomTraffic()
}, 300);

animate();

function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}