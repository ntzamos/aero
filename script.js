var socket = io.connect('http://83.212.99.94:85/');
var webkitAudioContext = null;
var isiPad = navigator.userAgent.match(/iPad/i) != null;
var ua = navigator.userAgent;
var isiPad = /iPad/i.test(ua) || /iPhone OS/i.test(ua);

function Box(width, height, depth) {
    SceneNode.call(this);
    this.width = width;
    this.height = height;
    this.depth = depth;
}
Box.extend(SceneNode);
var paired = false;
var Y = 0;
var X = 10;
var A = 25,
B = 2.5,
C = 10;
var buildings = new Array();

socket.on('move', function(data) {
    Y = data.y / 2;
    X = data.x;
    paired = true;
});
socket.on('start', function() {

    aeroplane.setPosition(new Vector3([0, 200, - 500]));

    document.getElementById('msgbox').style.display = 'none';
    finished = 0;
});


window.addEventListener("deviceorientation", function () {
    document.getElementById('x').value = event.alpha;
    document.getElementById('y').value = event.beta;
    document.getElementById('z').value = event.gamma;
    Y = event.beta;
    X = event.alpha;
}, true);

var app = new Application();

app.camera.setPosition(new Vector3([0, 10, - 40]))
app.camera.rotate(new Vector3([0, 1, 0]), Math.PI);
app.camera.zFar = 100000;
app.camera.setPerspective();


var angle = 0;
var theta = 0;

var up = false;

app.input.onKey('RIGHT_ARROW', {
    callback: function () {
        if (aeroplane.model.getOrientation().getAxisAngle().data[2] < 1.57) {
            angle += 0.04;
        }
    },
    repeat: true
});
app.input.onKey('LEFT_ARROW', {
    callback: function () {
        if (aeroplane.model.getOrientation().getAxisAngle().data[2] > -1.57) {
            angle -= 0.04;
        }
    },
    repeat: true
});
app.input.onKey('DOWN_ARROW', {
    callback: function () {
    },
    repeat: true
});
app.input.onKey('UP_ARROW', {
    callback: function () {},
    repeat: true
});
app.input.onKey('SPACE', {
    callback: function () {
        aeroplane.setPosition(new Vector3([0, 200, - 500]));
        document.getElementById('msgbox').style.display = 'none';
        finished = 0;
        angle = 0;
    },
    repeat: true
});



var aeroplane = new SceneNode();

aeroplane.setPosition(new Vector3([0, 200, - 500]));
aeroplane.appendChild(app.camera);
app.scene.appendChild(aeroplane);

var box = new Box(30, 2, 20);
aeroplane.appendChild(box);

app.importer.load('aeroplane.obj', function (model) {
    console.log('loaded!', model);
    aeroplane.appendChild(model);
    aeroplane.model = model;
    aeroplane.rotor = model.children[ 19 ];
});
var done = 0;
app.update = function (dt) {
    if (!finished && aeroplane.model) {
        document.getElementById('msgbox').style.display = 'none';
        //aeroplane.model.setScale(2);
        if (1) {
            //var old = angle;
            if(paired) {
                var mapa = Y * Math.PI / 80;
                if (Math.abs(angle-mapa)<0.1) mapa = angle;
                angle += (mapa-angle)/10;
            }
            document.title = angle;

            if (aeroplane.model) {
                var current = aeroplane.model.getOrientation();
                aeroplane.model.setOrientation(current.slerp(new Quaternion().setEuler(0, 0, angle), 0.25));
            }
        }
        var xMove = angle / 0.6;
        theta += angle * 0.01;
        aeroplane.rotate(new Vector3([0, - 1, 0]), angle * 0.01);

        if (Math.abs(angle) > 1) xMove = angle * 1 / (Math.abs(angle) * 0.6);

        if ((X >= -1 || Math.abs(Y) >= 4) && !up) {
            aeroplane.move(new Vector3([-20 * Math.sin(theta), 0, 20 * Math.cos(theta)]));
        } else {
            aeroplane.move(new Vector3([-40 * Math.sin(theta), 0, 40 * Math.cos(theta)]));
        }

        up = false;
            
        var cnt;
        var cent, sz;
        for (cnt = 0; cnt < buildings.length; ++cnt) {
            cent = buildings[cnt][0];
            sz = buildings[cnt][1];
            var v = aeroplane.getPosition();
            var q, w, r;
            for (q = -1; q <= 1; q += 2) {
                for (w = -1; w <= 1; w += 2) {
                    for (r = -1; r <= 1; r += 2) {
                        if (inrect(cent, sz, new Vector3([q * box.width / 2 + v.data[0], w * box.height / 2 + v.data[1], r * box.depth / 2 + v.data[2]]))) {
                            crash();
                        }
                    }
                }
            }
        }
    }
};

var finished = 0;
function crash() {
    //alert("You lost!");
    document.getElementById('msgbox').style.display = 'block';
    document.getElementById('msgbox').innerHTML = '<center><h1>!!!GAME OVER!!!</h1><br/> Press SPACE to play again :)</center>';
    finished = 1;
    //aeroplane.setPosition( new Vector3( [ 0, 200, -500 ] ) );
}

function inrect(cent, sz, vv) {
    var i;
    for (i = 0; i < 3; ++i) if (cent.data[i] + sz / 2 < vv.data[i] || cent.data[i] - sz / 2 > vv.data[i]) return false;
    return true;
}


var floor = new Rectangle(-10000, 10000, 10000, - 10000);
floor.setMaterial(new TexturedMaterial('resources/floor.jpg'));
app.scene.appendChild(floor);

var res = new TexturedMaterial('resources/skyline.jpg');

var skyline1 = new Rectangle(-5000, 10000, 5000, - 10000);
skyline1.setMaterial(res);
app.scene.appendChild(skyline1);
skyline1.rotate(new Vector3([0, - 1, 0]), Math.PI / 2);
skyline1.rotate(new Vector3([-1, 0, 0]), Math.PI / 2);
skyline1.setPosition(new Vector3([0, 0, 10000]));

var skyline2 = new Rectangle(-5000, 10000, 5000, - 10000);
skyline2.setMaterial(res);
app.scene.appendChild(skyline2);
skyline2.rotate(new Vector3([0, - 1, 0]), Math.PI / 2);
skyline2.rotate(new Vector3([1, 0, 0]), Math.PI / 2);
skyline2.rotate(new Vector3([0, 0, 1]), Math.PI);
skyline2.setPosition(new Vector3([0, 0, - 10000]));

var skyline3 = new Rectangle(-5000, 10000, 5000, - 10000);
skyline3.setMaterial(res);
app.scene.appendChild(skyline3);
skyline3.rotate(new Vector3([1, 0, 0]), Math.PI / 2);
skyline3.rotate(new Vector3([0, 1, 0]), Math.PI / 2);
skyline3.rotate(new Vector3([1, 0, 0]), Math.PI / 2);
skyline3.setPosition(new Vector3([-10000, 0, 0]));

var skyline4 = new Rectangle(-5000, 10000, 5000, - 10000);
skyline4.setMaterial(res);
app.scene.appendChild(skyline4);
skyline4.rotate(new Vector3([1, 0, 0]), Math.PI / 2);
skyline4.rotate(new Vector3([0, 1, 0]), Math.PI / 2);
skyline4.rotate(new Vector3([1, 0, 0]), Math.PI / 2);
skyline4.rotate(new Vector3([0, 1, 0]), Math.PI / 2);
skyline4.rotate(new Vector3([0, 1, 0]), Math.PI / 2);
skyline4.setPosition(new Vector3([10000, 0, 0]));



var cube = new Array(200);
var i, j, c = 0,
m = 0;
var buildingMaterial = new TexturedMaterial('resources/building.jpg');
for (i = -4; i <= 4; i++) {
    for (j = 1; j < 2; j++) {
        //1st
        cube[c] = new Cube();
        cube[c].setMaterial(buildingMaterial);
        app.scene.appendChild(cube[c]);
        var v = new Vector3([300 * i + 150, 50, 1500 * j + 750]);
        cube[c].move(v);
        cube[c].setScale(100);
        //buildings[m] = [ v , 100] ;++m;
        c++;

        cube[c] = new Cube();
        cube[c].setMaterial(buildingMaterial);
        app.scene.appendChild(cube[c]);
        v = new Vector3([300 * i + 150, 150, 1500 * j + 750]);
        cube[c].move(v);
        cube[c].setScale(100);
        buildings[m] = [v, 100];
        ++m;
        c++;

        cube[c] = new Cube();
        cube[c].setMaterial(buildingMaterial);
        app.scene.appendChild(cube[c]);
        v = new Vector3([300 * i + 150, 250, 1500 * j + 750])
        cube[c].move(v);
        cube[c].setScale(100);
        //buildings[m] = [ v , 100] ;++m;
        c++;
        //2nd
        cube[c] = new Cube();
        cube[c].setMaterial(buildingMaterial);
        app.scene.appendChild(cube[c]);
        v = new Vector3([300 * i, 60, 1500 * j])
        cube[c].move(v);
        cube[c].setScale(100);
        //buildings[m] = [ v , 100] ;++m;
        c++;

        cube[c] = new Cube();
        cube[c].setMaterial(buildingMaterial);
        app.scene.appendChild(cube[c]);
        v = new Vector3([300 * i, 160, 1500 * j]);
        cube[c].move(v);
        cube[c].setScale(100);
        buildings[m] = [v, 100];
        ++m;
        c++;

        cube[c] = new Cube();
        cube[c].setMaterial(buildingMaterial);
        app.scene.appendChild(cube[c]);
        v = new Vector3([300 * i, 260, 1500 * j]);
        cube[c].move(v);
        cube[c].setScale(100);
        //buildings[m] = [ v , 100] ;++m;
        c++;
    }
}