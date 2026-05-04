/* =================================================================
   EIRSPACE — Pinned Scroll-Driven 3D
   Samsung-product-style: 3D model is sticky in the viewport.
   As the user scrolls, the model interpolates between camera/model
   keyframes anchored to .pinned-section elements.
   ================================================================= */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') return;

    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =============================================================
       MATERIALS — shared metallic / industrial look
       ============================================================= */
    function makeMaterials() {
        return {
            white: new THREE.MeshStandardMaterial({
                color: 0xeeeeee, metalness: 0.55, roughness: 0.35
            }),
            offWhite: new THREE.MeshStandardMaterial({
                color: 0xd8d8d8, metalness: 0.5, roughness: 0.45
            }),
            dark: new THREE.MeshStandardMaterial({
                color: 0x1a1a1a, metalness: 0.7, roughness: 0.4
            }),
            chrome: new THREE.MeshStandardMaterial({
                color: 0xb0b0b0, metalness: 0.95, roughness: 0.18
            }),
            black: new THREE.MeshStandardMaterial({
                color: 0x0a0a0a, metalness: 0.6, roughness: 0.5
            }),
            green: new THREE.MeshStandardMaterial({
                color: 0x00ff41, emissive: 0x004410, metalness: 0.6, roughness: 0.2
            }),
            blueGlow: new THREE.MeshStandardMaterial({
                color: 0x4d9de0, emissive: 0x224488, emissiveIntensity: 1.5,
                metalness: 0.8, roughness: 0.1
            }),
            copper: new THREE.MeshStandardMaterial({
                color: 0xb87333, metalness: 0.85, roughness: 0.25
            }),
            flame: new THREE.MeshBasicMaterial({
                color: 0xffaa33, transparent: true, opacity: 0.85
            }),
            flameInner: new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.9
            })
        };
    }

    /* =============================================================
       FALCON-9-STYLE ROCKET (highly detailed)
       ============================================================= */
    function buildRocket(M) {
        var rocket = new THREE.Group();

        // ----- BODY (main stage) — tall white cylinder with paneling
        var bodyHeight = 5.0;
        var bodyRadius = 0.45;
        var body = new THREE.Mesh(
            new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 48),
            M.white
        );
        body.position.y = 0;
        rocket.add(body);

        // Panel seams (fine horizontal rings)
        for (var i = -2; i <= 2; i++) {
            var seam = new THREE.Mesh(
                new THREE.TorusGeometry(bodyRadius + 0.005, 0.008, 6, 48),
                M.dark
            );
            seam.rotation.x = Math.PI / 2;
            seam.position.y = i * 1.0;
            rocket.add(seam);
        }

        // Vertical panel lines (4 sides)
        for (var p = 0; p < 4; p++) {
            var line = new THREE.Mesh(
                new THREE.BoxGeometry(0.005, bodyHeight - 0.4, 0.005),
                M.dark
            );
            var ang = (p / 4) * Math.PI * 2;
            line.position.set(Math.cos(ang) * (bodyRadius + 0.001), 0, Math.sin(ang) * (bodyRadius + 0.001));
            rocket.add(line);
        }

        // EIRSPACE logo painted on rocket body — un seul logo, face avant
        // Cylindre partiel qui couvre un arc large pour un logo bien visible
        var rocketLogoLoader = new THREE.TextureLoader();
        var rocketLogoMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        rocketLogoLoader.load(
            './static/logo_eirspace_512.png',
            function (tex) {
                if (tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
                else if (tex.encoding !== undefined) tex.encoding = 3001;
                tex.anisotropy = 8;
                rocketLogoMat.map = tex;
                rocketLogoMat.needsUpdate = true;
                console.log('[EIRSPACE] Rocket logo texture loaded.');
            },
            undefined,
            function () {
                console.error('[EIRSPACE] Failed to load rocket logo.');
                rocketLogoMat.color.set(0x4d9de0);
            }
        );

        // Un seul gros patch sur la face avant (vers +Z, soit angle = -π/2 dans le
        // système thetaStart de CylinderGeometry qui démarre à +X)
        var logoArc = Math.PI / 2.5;          // ~72° d'arc, bien visible
        var logoHeight = 1.0;                  // hauteur du logo sur la fusée
        var logoY = 0.4;
        var logoR = bodyRadius + 0.006;
        // Centrer l'arc sur la face droite (vers +X dans le système thetaStart
        // de CylinderGeometry qui démarre à +X, soit angle 0)
        var thetaStart = -logoArc / 2;

        var logoMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(
                logoR, logoR,
                logoHeight,
                32, 1, true,
                thetaStart, logoArc
            ),
            rocketLogoMat
        );
        logoMesh.position.y = logoY;
        rocket.add(logoMesh);

        // ----- INTERSTAGE (between main and upper stage)
        var interstage = new THREE.Mesh(
            new THREE.CylinderGeometry(bodyRadius * 0.95, bodyRadius, 0.25, 48),
            M.dark
        );
        interstage.position.y = bodyHeight / 2 + 0.125;
        rocket.add(interstage);

        // ----- UPPER STAGE (slightly narrower)
        var upperRadius = bodyRadius * 0.9;
        var upperHeight = 1.6;
        var upper = new THREE.Mesh(
            new THREE.CylinderGeometry(upperRadius, upperRadius, upperHeight, 48),
            M.offWhite
        );
        upper.position.y = bodyHeight / 2 + 0.25 + upperHeight / 2;
        rocket.add(upper);

        // ----- PAYLOAD FAIRING (the iconic curve)
        var fairingHeight = 1.4;
        var fairingY = bodyHeight / 2 + 0.25 + upperHeight + fairingHeight / 2;
        // Build using LatheGeometry for the curve
        var fairingPoints = [];
        var segs = 16;
        for (var s = 0; s <= segs; s++) {
            var t = s / segs;
            // Ogive curve: starts at full radius, tapers to point
            var r = upperRadius * Math.cos(t * Math.PI / 2 * 0.95);
            var y = t * fairingHeight - fairingHeight / 2;
            fairingPoints.push(new THREE.Vector2(Math.max(r, 0.005), y));
        }
        var fairingGeo = new THREE.LatheGeometry(fairingPoints, 48);
        var fairing = new THREE.Mesh(fairingGeo, M.offWhite);
        fairing.position.y = fairingY;
        rocket.add(fairing);

        // ----- WINDOW / RVD (small porthole on upper stage)
        var porthole = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16),
            M.blueGlow
        );
        porthole.position.set(0, bodyHeight / 2 + 0.25 + upperHeight - 0.3, upperRadius);
        rocket.add(porthole);

        // ----- GRID FINS (4, near the top of the main body) — Falcon 9 style
        var gridFinGroup = new THREE.Group();
        var gridFinShape = new THREE.Shape();
        gridFinShape.moveTo(0, 0);
        gridFinShape.lineTo(0.4, 0);
        gridFinShape.lineTo(0.4, 0.5);
        gridFinShape.lineTo(0, 0.5);
        gridFinShape.lineTo(0, 0);
        var gridFinGeo = new THREE.ExtrudeGeometry(gridFinShape, { depth: 0.06, bevelEnabled: false });

        for (var gi = 0; gi < 4; gi++) {
            var gf = new THREE.Mesh(gridFinGeo, M.chrome);
            var ang2 = (gi / 4) * Math.PI * 2;
            gf.position.set(Math.cos(ang2) * bodyRadius, bodyHeight / 2 - 0.5, Math.sin(ang2) * bodyRadius);
            gf.rotation.y = ang2 + Math.PI / 2;
            gridFinGroup.add(gf);
        }
        rocket.add(gridFinGroup);

        // ----- LANDING LEGS (4, near the bottom) — folded position
        var legGroup = new THREE.Group();
        for (var li = 0; li < 4; li++) {
            var leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 1.4, 0.06),
                M.dark
            );
            var lang = (li / 4) * Math.PI * 2 + Math.PI / 4;
            leg.position.set(Math.cos(lang) * (bodyRadius - 0.02), -bodyHeight / 2 + 0.7, Math.sin(lang) * (bodyRadius - 0.02));
            leg.rotation.set(0, lang, 0);
            legGroup.add(leg);
        }
        rocket.add(legGroup);

        // ----- MAIN ENGINE (visible at the bottom — Merlin/Raptor style)
        var bell = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.42, 0.5, 32),
            M.chrome
        );
        bell.position.y = -bodyHeight / 2 - 0.25;
        rocket.add(bell);

        var bellInner = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.38, 0.45, 32, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0x111111, metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide
            })
        );
        bellInner.position.y = -bodyHeight / 2 - 0.25;
        rocket.add(bellInner);

        // Engine plumbing rings
        for (var pl = 0; pl < 3; pl++) {
            var ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.36 - pl * 0.02, 0.012, 6, 32),
                M.copper
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -bodyHeight / 2 - 0.1 - pl * 0.08;
            rocket.add(ring);
        }

        // ----- FLAME (animated)
        var flameOuter = new THREE.Mesh(
            new THREE.ConeGeometry(0.32, 1.2, 24),
            M.flame
        );
        flameOuter.position.y = -bodyHeight / 2 - 1.1;
        flameOuter.rotation.x = Math.PI;
        flameOuter.userData.isFlame = true;
        rocket.add(flameOuter);

        var flameInner = new THREE.Mesh(
            new THREE.ConeGeometry(0.18, 0.7, 18),
            M.flameInner
        );
        flameInner.position.y = -bodyHeight / 2 - 0.85;
        flameInner.rotation.x = Math.PI;
        flameInner.userData.isFlameInner = true;
        rocket.add(flameInner);

        // Center the whole rocket
        rocket.position.y = -0.5; // visual balance

        // Store named parts for keyframe targeting
        rocket.userData.parts = {
            fairingY: fairingY,
            engineY: -bodyHeight / 2 - 0.25,
            gridFinsY: bodyHeight / 2 - 0.5,
            bodyCenterY: 0
        };

        return rocket;
    }

    /* =============================================================
       PRO QUADCOPTER (DJI/Inspire-style)
       ============================================================= */
    function buildDrone(M) {
        var drone = new THREE.Group();

        // ----- CENTRAL FUSELAGE (sleek aerodynamic body)
        var fuselageBottom = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            M.dark
        );
        fuselageBottom.scale.set(1, 0.5, 1.4);
        drone.add(fuselageBottom);

        var fuselageTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            M.offWhite
        );
        fuselageTop.scale.set(1, 0.45, 1.4);
        drone.add(fuselageTop);

        // ----- LOGO STICKERS sur le drone (MeshBasicMaterial pour visibilité)
        var droneLoader = new THREE.TextureLoader();
        var droneLogoMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });
        droneLoader.load(
            './static/logo_eirspace_512.png',
            function (tex) {
                if (tex.colorSpace !== undefined) {
                    tex.colorSpace = THREE.SRGBColorSpace;
                } else if (tex.encoding !== undefined) {
                    tex.encoding = 3001;
                }
                tex.anisotropy = 8;
                droneLogoMat.map = tex;
                droneLogoMat.needsUpdate = true;
            },
            undefined,
            function (err) {
                console.error('[EIRSPACE] Failed to load drone logo:', err);
                droneLogoMat.color.set(0x4d9de0);
            }
        );

        // Top sticker — calotte ellipsoïdale custom qui épouse exactement la
        // courbure du dôme aplati du fuselage (rayon 0.7×0.45×0.98), avec des
        // UVs planaires (projection top-down) pour que le logo apparaisse
        // normalement vu de dessus, sans étirement.
        var stickerGeo = (function () {
            var rx = 0.7, ry = 0.7 * 0.45, rz = 0.7 * 1.4; // matchent fuselageTop scale
            var radius = 0.42;       // rayon dans le plan XZ couvert par le sticker
            var segs = 24;
            var rings = 8;
            var positions = [];
            var uvs = [];
            var indices = [];

            // Génère une grille radiale de vertices, projetés sur la surface
            // de l'ellipsoïde supérieur (y >= 0).
            for (var ri = 0; ri <= rings; ri++) {
                var rNorm = ri / rings; // 0 au centre, 1 au bord
                var rXZ = rNorm * radius;
                for (var si = 0; si <= segs; si++) {
                    var ang = (si / segs) * Math.PI * 2;
                    var x = Math.cos(ang) * rXZ;
                    var z = Math.sin(ang) * rXZ * (rz / rx); // étire en Z car fuselage est plus long
                    // Calculer y sur l'ellipsoïde : (x/rx)² + (y/ry)² + (z/rz)² = 1
                    var k = (x / rx) * (x / rx) + (z / rz) * (z / rz);
                    var y = ry * Math.sqrt(Math.max(0, 1 - k)) + 0.001; // léger offset
                    positions.push(x, y, z);
                    // UV planaires : x dans [-radius, +radius] mappé à [0,1]
                    // (projection vue de dessus, le logo apparaît normalement)
                    var u = (x / radius + 1) / 2;
                    var v = 1 - (z / (radius * rz / rx) + 1) / 2; // V inversé pour pas d'effet miroir
                    uvs.push(u, v);
                }
            }

            // Indices pour les triangles (grille rings × segs)
            for (var ri2 = 0; ri2 < rings; ri2++) {
                for (var si2 = 0; si2 < segs; si2++) {
                    var a = ri2 * (segs + 1) + si2;
                    var b = a + segs + 1;
                    indices.push(a, b, a + 1);
                    indices.push(b, b + 1, a + 1);
                }
            }

            var geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geo.setIndex(indices);
            geo.computeVertexNormals();
            return geo;
        })();

        var topSticker = new THREE.Mesh(stickerGeo, droneLogoMat);
        drone.add(topSticker);

        // (Dôme GPS retiré — préférence utilisateur)

        // ----- GIMBAL CAMERA (front)
        var gimbalRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.04, 12, 32),
            M.chrome
        );
        gimbalRing.rotation.x = Math.PI / 2;
        gimbalRing.position.set(0, -0.18, 0.85);
        drone.add(gimbalRing);

        var camera = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 24, 24),
            M.black
        );
        camera.position.set(0, -0.18, 0.85);
        drone.add(camera);

        var lens = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24),
            M.blueGlow
        );
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, -0.18, 0.95);
        drone.add(lens);

        // ----- ARMS (4, X-config)
        var armPositions = [
            { x:  1.0, z:  1.0, ang:  Math.PI / 4 },
            { x: -1.0, z:  1.0, ang: -Math.PI / 4 },
            { x:  1.0, z: -1.0, ang: -Math.PI / 4 },
            { x: -1.0, z: -1.0, ang:  Math.PI / 4 }
        ];

        armPositions.forEach(function (p) {
            // Arm tube
            var armLen = Math.sqrt(p.x * p.x + p.z * p.z) - 0.3;
            var arm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.06, armLen, 16),
                M.dark
            );
            // Position halfway, angle toward corner
            var midX = p.x / 2;
            var midZ = p.z / 2;
            arm.position.set(midX, 0, midZ);
            arm.lookAt(new THREE.Vector3(p.x, 0, p.z));
            arm.rotateX(Math.PI / 2);
            drone.add(arm);

            // Motor housing
            var motor = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.15, 0.18, 24),
                M.chrome
            );
            motor.position.set(p.x, 0.06, p.z);
            drone.add(motor);

            // Motor cap (red dot for visual interest)
            var motorCap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16),
                new THREE.MeshStandardMaterial({
                    color: 0xff3333, emissive: 0x661111, metalness: 0.6, roughness: 0.3
                })
            );
            motorCap.position.set(p.x, 0.18, p.z);
            drone.add(motorCap);

            // Rotor blades (will spin)
            var rotorGroup = new THREE.Group();
            for (var b = 0; b < 2; b++) {
                var blade = new THREE.Mesh(
                    new THREE.BoxGeometry(0.85, 0.015, 0.07),
                    new THREE.MeshStandardMaterial({
                        color: 0x222222, metalness: 0.3, roughness: 0.7,
                        transparent: true, opacity: 0.9
                    })
                );
                blade.rotation.y = (b * Math.PI / 2);
                rotorGroup.add(blade);
            }
            rotorGroup.position.set(p.x, 0.22, p.z);
            rotorGroup.userData.isRotor = true;
            drone.add(rotorGroup);

            // Navigation lights
            var navLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 12, 12),
                new THREE.MeshStandardMaterial({
                    color: p.x > 0 ? 0x00ff00 : 0xff0000,
                    emissive: p.x > 0 ? 0x00ff00 : 0xff0000,
                    emissiveIntensity: 1.5
                })
            );
            navLight.position.set(p.x * 1.05, -0.05, p.z * 1.05);
            navLight.userData.isNavLight = true;
            navLight.userData.lightSign = p.x > 0 ? 1 : -1;
            drone.add(navLight);
        });

        // ----- LANDING SKIDS
        for (var sd = -1; sd <= 1; sd += 2) {
            var skid = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 1.6, 12),
                M.chrome
            );
            skid.rotation.x = Math.PI / 2;
            skid.position.set(sd * 0.5, -0.45, 0);
            drone.add(skid);

            // Skid uprights
            for (var su = -1; su <= 1; su += 2) {
                var upright = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8),
                    M.chrome
                );
                upright.position.set(sd * 0.5, -0.27, su * 0.6);
                drone.add(upright);
            }
        }

        return drone;
    }

    /* =============================================================
       ASTRO — planète EIRSPACE + champ d'étoiles
       ============================================================= */
    function buildAstroScene(scene) {
        // Champ d'étoiles
        var starCount = 2000;
        var positions = new Float32Array(starCount * 3);
        var colors = new Float32Array(starCount * 3);
        var palette = [
            new THREE.Color(0xffffff),
            new THREE.Color(0x88aaff),
            new THREE.Color(0xffeebb),
            new THREE.Color(0xffaa66),
            new THREE.Color(0x00ff41)
        ];

        for (var i = 0; i < starCount; i++) {
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.acos(2 * Math.random() - 1);
            var r = 7 + Math.random() * 4;
            positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
            positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i*3+2] = r * Math.cos(phi);
            var c = palette[Math.floor(Math.random() * palette.length)];
            colors[i*3]   = c.r;
            colors[i*3+1] = c.g;
            colors[i*3+2] = c.b;
        }

        var geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        var starMat = new THREE.PointsMaterial({
            size: 0.09, vertexColors: true, transparent: true, opacity: 0.95, sizeAttenuation: true
        });
        var points = new THREE.Points(geom, starMat);

        // Soleil — lumière directionnelle forte depuis le côté droit
        var sunLight = new THREE.DirectionalLight(0xfff0cc, 3.2);
        sunLight.position.set(7, 3, 5);
        scene.add(sunLight);

        // Lumière de rebond subtile côté ombre (simuler la lumière diffusée)
        var bounceLight = new THREE.PointLight(0x4d9de0, 0.5, 12);
        bounceLight.position.set(-5, -2, -3);
        scene.add(bounceLight);

        // Planète EIRSPACE — sphère avec logo texturé
        // Pas d'émissif sur la base : le côté nuit reste sombre, côté jour est illuminé
        var planetMat = new THREE.MeshStandardMaterial({
            color: 0x243050,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            metalness: 0.0,
            roughness: 0.7
        });
        var planet = new THREE.Mesh(new THREE.SphereGeometry(1.8, 64, 64), planetMat);

        var logoLoader = new THREE.TextureLoader();
        logoLoader.load('./static/logo_eirspace_512.png', function (tex) {
            if (tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
            else if (tex.encoding !== undefined) tex.encoding = 3001;
            tex.anisotropy = 8;
            planetMat.map = tex;
            planetMat.emissiveMap = tex;
            planetMat.emissiveIntensity = 0.12;
            planetMat.needsUpdate = true;
        }, undefined, function () {
            planetMat.color.set(0x4d9de0);
        });

        // Atmosphère (halo vert EIRSPACE)
        var atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(2.05, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.07, side: THREE.BackSide })
        );

        // Couronne extérieure bleue
        var corona = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x4d9de0, transparent: true, opacity: 0.04, side: THREE.BackSide })
        );

        scene.add(points);
        scene.add(planet);
        scene.add(atmosphere);
        scene.add(corona);

        return { points: points, planet: planet, atmosphere: atmosphere, corona: corona };
    }

    /* =============================================================
       LIGHTING
       ============================================================= */
    function setupLights(scene) {
        scene.add(new THREE.AmbientLight(0x40445a, 0.7));
        var key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(5, 6, 5);
        scene.add(key);
        var rim = new THREE.PointLight(0x00ff41, 1.6, 20);
        rim.position.set(-4, 2, 3);
        scene.add(rim);
        var fill = new THREE.PointLight(0x4d9de0, 0.8, 18);
        fill.position.set(3, -2, -4);
        scene.add(fill);
    }

    /* =============================================================
       PINNED EXPERIENCE — generic wrapper
       Reads keyframes from .pinned-section[data-keyframe="..."] elements
       and interpolates the model state along the page scroll.
       ============================================================= */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function smoothstep(t) { return t * t * (3 - 2 * t); }

    function initPinned(stage, type) {
        var canvas = stage.querySelector('.pinned-3d-canvas');
        if (!canvas) return;
        var experience = stage.closest('.pinned-scroll-experience');
        if (!experience) return;

        var sections = experience.querySelectorAll('.pinned-section');
        if (!sections.length) return;

        // Read keyframes from data-* attributes
        var keyframes = Array.prototype.map.call(sections, function (sec) {
            return {
                el: sec,
                rotX: parseFloat(sec.dataset.rotX) || 0,
                rotY: parseFloat(sec.dataset.rotY) || 0,
                posX: parseFloat(sec.dataset.posX) || 0,
                posY: parseFloat(sec.dataset.posY) || 0,
                posZ: parseFloat(sec.dataset.posZ) || 0,
                camZ: parseFloat(sec.dataset.camZ) || 7,
                camY: parseFloat(sec.dataset.camY) || 0
            };
        });

        // Three setup
        var renderer = new THREE.WebGLRenderer({
            canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        setupLights(scene);

        var M = makeMaterials();
        var model = null;
        var astro = null;

        if (type === 'rocket') {
            model = buildRocket(M);
            scene.add(model);
        } else if (type === 'drone') {
            model = buildDrone(M);
            scene.add(model);
        } else if (type === 'astro') {
            astro = buildAstroScene(scene);
            model = astro.points; // proxy for transforms (we'll handle in tick)
        }

        // Responsive fit factor: on narrow viewports, we need to pull the camera
        // back so the model isn't clipped on the sides. We compute a scale based
        // on viewport width: 1.0 at >=1200px, up to 1.8 at 360px.
        function getFitScale() {
            var w = window.innerWidth;
            if (w >= 1200) return 1.0;
            if (w >= 900)  return 1.1;
            if (w >= 700)  return 1.25;
            if (w >= 500)  return 1.5;
            if (w >= 380)  return 1.7;
            return 1.85;
        }

        // On mobile we also widen the FOV slightly so the model breathes
        function getFov() {
            var w = window.innerWidth;
            if (w >= 900) return 35;
            if (w >= 600) return 42;
            return 50;
        }

        // On mobile, lateral keyframe offsets (posX) become irrelevant since the
        // text card is below the 3D, not next to it. Zero them out on narrow.
        function lateralFactor() {
            return window.innerWidth >= 900 ? 1 : 0;
        }

        function fit() {
            var w = stage.clientWidth || window.innerWidth;
            var h = stage.clientHeight || window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.fov = getFov();
            camera.updateProjectionMatrix();
        }
        fit();
        window.addEventListener('resize', fit);

        // Smooth-interpolated state
        var state = {
            rotX: keyframes[0].rotX,
            rotY: keyframes[0].rotY,
            posX: keyframes[0].posX,
            posY: keyframes[0].posY,
            posZ: keyframes[0].posZ,
            camZ: keyframes[0].camZ,
            camY: keyframes[0].camY
        };

        // Compute target state from current scroll position
        function computeTarget() {
            var rect = experience.getBoundingClientRect();
            var expHeight = experience.offsetHeight;
            var viewportH = window.innerHeight;
            var scrolled = -rect.top;
            // total scrollable distance in this experience
            var totalScroll = expHeight - viewportH;
            if (totalScroll <= 0) totalScroll = 1;
            var globalT = Math.max(0, Math.min(1, scrolled / totalScroll));

            // Map to keyframe interpolation
            var n = keyframes.length;
            var seg = globalT * (n - 1);
            var i0 = Math.floor(seg);
            var i1 = Math.min(n - 1, i0 + 1);
            var localT = smoothstep(seg - i0);

            var k0 = keyframes[i0], k1 = keyframes[i1];
            var fs = getFitScale();
            var lf = lateralFactor();
            return {
                rotX: lerp(k0.rotX, k1.rotX, localT),
                rotY: lerp(k0.rotY, k1.rotY, localT),
                // posX neutralized on narrow viewports (card below, not beside)
                posX: lerp(k0.posX, k1.posX, localT) * lf,
                posY: lerp(k0.posY, k1.posY, localT),
                posZ: lerp(k0.posZ, k1.posZ, localT),
                // Camera pulled back proportionally on narrow screens
                camZ: lerp(k0.camZ, k1.camZ, localT) * fs,
                camY: lerp(k0.camY, k1.camY, localT),
                activeIdx: Math.round(seg)
            };
        }

        // Activation tracking for content cards & progress dots
        var lastActiveIdx = -1;
        var progressDots = [];
        // Build progress indicator
        if (sections.length > 1) {
            var prog = document.createElement('div');
            prog.className = 'pin-progress';
            keyframes.forEach(function (_, i) {
                var dot = document.createElement('div');
                dot.className = 'pin-progress-dot';
                if (i === 0) dot.classList.add('is-active');
                prog.appendChild(dot);
                progressDots.push(dot);
            });
            stage.parentNode.appendChild(prog);
        }

        function setActive(idx) {
            if (idx === lastActiveIdx) return;
            lastActiveIdx = idx;
            sections.forEach(function (s, i) {
                s.classList.toggle('is-active', i === idx);
            });
            progressDots.forEach(function (d, i) {
                d.classList.toggle('is-active', i === idx);
            });
        }

        // Initialize all sections except first as inactive
        sections.forEach(function (s, i) {
            if (i === 0) s.classList.add('is-active');
        });

        var t0 = performance.now();
        var ease = 0.10;

        function tick() {
            var now = performance.now();
            var dt = (now - t0) / 1000;
            t0 = now;

            var target = computeTarget();
            setActive(target.activeIdx);

            // Smooth interpolation toward target
            state.rotX = lerp(state.rotX, target.rotX, ease);
            state.rotY = lerp(state.rotY, target.rotY, ease);
            state.posX = lerp(state.posX, target.posX, ease);
            state.posY = lerp(state.posY, target.posY, ease);
            state.posZ = lerp(state.posZ, target.posZ, ease);
            state.camZ = lerp(state.camZ, target.camZ, ease);
            state.camY = lerp(state.camY, target.camY, ease);

            if (type === 'rocket') {
                model.rotation.x = state.rotX;
                model.rotation.y = state.rotY + (prefersReduced ? 0 : dt * 0.15); // gentle continuous spin baseline
                model.position.set(state.posX, state.posY, state.posZ);

                // Flame flicker
                model.children.forEach(function (c) {
                    if (c.userData.isFlame) {
                        c.scale.y = 1 + Math.sin(now * 0.025) * 0.1 + Math.random() * 0.06;
                        c.material.opacity = 0.75 + Math.random() * 0.18;
                    }
                    if (c.userData.isFlameInner) {
                        c.scale.y = 1 + Math.sin(now * 0.03) * 0.08;
                        c.material.opacity = 0.85 + Math.random() * 0.1;
                    }
                });
            } else if (type === 'drone') {
                model.rotation.x = state.rotX;
                model.rotation.y = state.rotY + (prefersReduced ? 0 : dt * 0.2);
                model.position.set(state.posX, state.posY, state.posZ);

                // Spin rotors + blink lights
                model.children.forEach(function (c) {
                    if (c.userData.isRotor) c.rotation.y += 0.7;
                    if (c.userData.isNavLight) {
                        var phase = now * 0.004 + (c.userData.lightSign > 0 ? 0 : Math.PI);
                        c.material.emissiveIntensity = 0.5 + (Math.sin(phase) + 1) * 0.7;
                    }
                });
            } else if (type === 'astro') {
                astro.points.rotation.y = state.rotY + dt * 0.04;
                astro.points.rotation.x = state.rotX + Math.sin(now * 0.0001) * 0.15;
                astro.planet.rotation.y += dt * 0.18;
                astro.planet.rotation.x = Math.sin(now * 0.0003) * 0.08;
                astro.atmosphere.scale.setScalar(1 + Math.sin(now * 0.0015) * 0.03);
                astro.corona.scale.setScalar(1 + Math.cos(now * 0.0012) * 0.05);
            }

            camera.position.set(0, state.camY, state.camZ);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* =============================================================
       AUTO-INIT
       ============================================================= */
    function init() {
        var stages = document.querySelectorAll('.pinned-3d-stage');
        stages.forEach(function (stage) {
            var type = stage.dataset.three;
            if (!type) return;
            initPinned(stage, type);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
