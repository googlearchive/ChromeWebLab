/**
 * A mootols class version of Joe Walnes' cool THREE.js-based g-code viewer
 * Original from https://github.com/joewalnes/gcode-viewer/blob/master/web/ui.js
 *
 *
 * This library is licensed under the following terms:
 *      Copyright (c) 2012 Joe Walnes
 *
 *      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 */
//

var GCodeScene = new Class({

    Implements: [Events],

    _element: null,
    _scene: null,
    _object: null,
    _forceRenderCount: 1,

    enableControls: true,
    enableRendering: true,

    /**
     * Constructs a new GCodeScene.
     *
     * @param element An HTMLElement in which to anchor the THREE.js scene that will visualize g-code files.
     *
     */
    initialize: function(element, height, width) {
        this._element = element;
        this._initializeScene(this._element, height, width);
    },

    loadGCodeFromString: function(gcode, width) {
        if (this._object)
            this._scene.remove(this._object);
        this._object = this._createObjectFromGCode(gcode);
        this._scene.add(this._object);
        this.forceRender();
    },

    forceRender: function() {
        this._forceRenderCount = 1;
    },

    //
    // private methods
    //

    _initializeScene: function(element, height, width) {
        // Renderer
        var renderer = new THREE.WebGLRenderer({
            clearColor: 0x000000,
            clearAlpha: 1
        });
        renderer.setSize(width, height);
        $(renderer.domElement).inject(element);
        renderer.clear();

        // Scene
        var scene = new THREE.Scene();

        // Lights...
        [
            [0, 0, 1, 0xFFFFCC],
            [0, 1, 0, 0xFFCCFF],
            [1, 0, 0, 0xCCFFFF],
            [0, 0, -1, 0xCCCCFF],
            [0, -1, 0, 0xCCFFCC],
            [-1, 0, 0, 0xFFCCCC]
        ].forEach(function(position) {
            var light = new THREE.DirectionalLight(position[3]);
            light.position.set(position[0], position[1], position[2]).normalize();
            scene.add(light);
        });

        // Camera...
        var fov = 45,
            aspect = width / height,
            near = 1,
            far = 10000,
            camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        //camera.rotationAutoUpdate = true;
        //camera.position.x = 0;
        //camera.position.y = 500;
        camera.position.z = 300;
        //camera.lookAt(scene.position);
        scene.add(camera);
        controls = new THREE.TrackballControls(camera, element);
        controls.noPan = true;
        controls.dynamicDampingFactor = 0.15;

        // Action!
        render = function() {
            controls.enabled = this.enableControls;
            controls.update();

            if (this.enableRendering || (this._forceRenderCount-- > 0))
                renderer.render(scene, camera);

            requestAnimationFrame(render.bind(this)); // And repeat...
        }.bind(this);
        render();

        // // Fix coordinates up if window is resized.
        // $(window).on('resize', function() {
        // 	renderer.setSize(element.width(), element.height());
        // 	camera.aspect = element.width() / element.height();
        // 	camera.updateProjectionMatrix();
        // 	controls.screen.width = window.innerWidth;
        // 	controls.screen.height = window.innerHeight;
        // });

        this._scene = scene;
    },

    _createObjectFromGCode: function(gcode) {
        // GCode descriptions come from:
        //    http://reprap.org/wiki/G-code
        //    http://en.wikipedia.org/wiki/G-code
        //    SprintRun source code

        var lastLine = {
            x: 0,
            y: 0,
            z: 0,
            e: 0,
            f: 0,
            extruding: false
        };

        var layers = [];
        var layer = undefined;
        var bbbox = {
            min: {
                x: 100000,
                y: 100000,
                z: 100000
            },
            max: {
                x: -100000,
                y: -100000,
                z: -100000
            }
        };

        function newLayer(line) {
            layer = {
                type: {},
                layer: layers.length,
                z: line.z,
            };
            layers.push(layer);
        }

        function getLineGroup(line) {
            if (layer == undefined)
                newLayer(line);
            var speed = Math.round(line.e / 1000);
            var grouptype = (line.extruding ? 10000 : 0) + speed;
            var color = new THREE.Color(line.extruding ? 0xffffff : 0x0000ff);
            if (layer.type[grouptype] == undefined) {
                layer.type[grouptype] = {
                    type: grouptype,
                    feed: line.e,
                    extruding: line.extruding,
                    color: color,
                    segmentCount: 0,
                    material: new THREE.LineBasicMaterial({
                        opacity: line.extruding ? 0.5 : 0.4,
                        transparent: true,
                        linewidth: 1,
                        vertexColors: THREE.FaceColors
                    }),
                    geometry: new THREE.Geometry(),
                }
            }
            return layer.type[grouptype];
        }

        function addSegment(p1, p2) {
            var group = getLineGroup(p2);
            var geometry = group.geometry;

            group.segmentCount++;
            geometry.vertices.push(new THREE.Vertex(
                new THREE.Vector3(p1.x, p1.y, p1.z)));
            geometry.vertices.push(new THREE.Vertex(
                new THREE.Vector3(p2.x, p2.y, p2.z)));
            geometry.colors.push(group.color);
            geometry.colors.push(group.color);
            if (p2.extruding) {
                bbbox.min.x = Math.min(bbbox.min.x, p2.x);
                bbbox.min.y = Math.min(bbbox.min.y, p2.y);
                bbbox.min.z = Math.min(bbbox.min.z, p2.z);
                bbbox.max.x = Math.max(bbbox.max.x, p2.x);
                bbbox.max.y = Math.max(bbbox.max.y, p2.y);
                bbbox.max.z = Math.max(bbbox.max.z, p2.z);
            }
        }
        var relative = false;

        function delta(v1, v2) {
            return relative ? v2 : v2 - v1;
        }

        function absolute(v1, v2) {
            return relative ? v1 + v2 : v2;
        }

        var parser = new GCodeParser({

            G1: function(args, line) {
                // Example: G1 Z1.0 F3000
                //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
                //          G1 E104.25841 F1800.0
                // Go in a straight line from the current (X, Y) point
                // to the point (90.6, 13.8), extruding material as the move
                // happens from the current extruded length to a length of
                // 22.4 mm.

                var newLine = {
                    x: args.x !== undefined ? absolute(lastLine.x, args.x) : lastLine.x,
                    y: args.y !== undefined ? absolute(lastLine.y, args.y) : lastLine.y,
                    z: args.z !== undefined ? absolute(lastLine.z, args.z) : lastLine.z,
                    e: args.e !== undefined ? absolute(lastLine.e, args.e) : lastLine.e,
                    f: args.f !== undefined ? absolute(lastLine.f, args.f) : lastLine.f,
                };
                /* layer change detection is or made by watching Z, it's made by
				 watching when we extrude at a new Z position */
                if (delta(lastLine.e, newLine.e) > 0) {
                    newLine.extruding = delta(lastLine.e, newLine.e) > 0;
                    if (layer == undefined || newLine.z != layer.z)
                        newLayer(newLine);
                }
                addSegment(lastLine, newLine);
                lastLine = newLine;
            },

            G21: function(args) {
                // G21: Set Units to Millimeters
                // Example: G21
                // Units from now on are in millimeters. (This is the RepRap default.)

                // No-op: So long as G20 is not supported.
            },

            G90: function(args) {
                // G90: Set to Absolute Positioning
                // Example: G90
                // All coordinates from now on are absolute relative to the
                // origin of the machine. (This is the RepRap default.)

                relative = false;
            },

            G91: function(args) {
                // G91: Set to Relative Positioning
                // Example: G91
                // All coordinates from now on are relative to the last position.

                // TODO!
                relative = true;
            },

            G92: function(args) { // E0
                // G92: Set Position
                // Example: G92 E0
                // Allows programming of absolute zero point, by reseting the
                // current position to the values specified. This would set the
                // machine's X coordinate to 10, and the extrude coordinate to 90.
                // No physical motion will occur.

                // TODO: Only support E0
                var newLine = lastLine;
                newLine.x = args.x !== undefined ? args.x : newLine.x;
                newLine.y = args.y !== undefined ? args.y : newLine.y;
                newLine.z = args.z !== undefined ? args.z : newLine.z;
                newLine.e = args.e !== undefined ? args.e : newLine.e;
                lastLine = newLine;
            },

            M82: function(args) {
                // M82: Set E codes absolute (default)
                // Descriped in Sprintrun source code.

                // No-op, so long as M83 is not supported.
            },

            M84: function(args) {
                // M84: Stop idle hold
                // Example: M84
                // Stop the idle hold on all axis and extruder. In some cases the
                // idle hold causes annoying noises, which can be stopped by
                // disabling the hold. Be aware that by disabling idle hold during
                // printing, you will get quality issues. This is recommended only
                // in between or after printjobs.

                // No-op
            },

            'default': function(args, info) {
                console.error('Unsupported command:', args.cmd, args, info);
            },
        });
        parser.parse(gcode);

        console.log("Layer Count ", layers.length);

        var object = new THREE.Object3D();

        for (var lid in layers) {
            var layer = layers[lid];
            //		console.log("Layer ", layer.layer);
            for (var tid in layer.type) {
                var type = layer.type[tid];
                //			console.log("Layer ", layer.layer, " type ", type.type, " seg ", type.segmentCount);
                object.add(new THREE.Line(type.geometry, type.material, THREE.LinePieces));
            }
        }
        console.log("bbox ", bbbox);

        // Center
        var scale = 3; // TODO: Auto size

        var center = new THREE.Vector3(
            bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
            bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
            bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2));
        console.log("center ", center);

        object.position = center.multiplyScalar(-scale);

        object.scale.multiplyScalar(scale);

        return object;
    }
});
