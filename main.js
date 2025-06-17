// 全局变量
let scene, camera, renderer, controls;
let balls = [];
let animationId;
let isPaused = false;

// 物理参数
let gravity = 0.8;
let bounce = 0.7;
let friction = 0.99;

// 场景边界
const BOUNDARY = {
    x: 50,
    y: 50,
    z: 50
};

// 小球类
class Ball {
    constructor(x, y, z, radius, color) {
        // 创建几何体和材质
        this.geometry = new THREE.SphereGeometry(radius, 32, 32);
        this.material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            specular: 0x111111
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        // 设置初始位置
        this.mesh.position.set(x, y, z);
        
        // 物理属性
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10, // 随机初始水平速度
            Math.random() * 5 + 5,      // 随机初始向上速度
            (Math.random() - 0.5) * 10  // 随机初始深度速度
        );
        
        this.radius = radius;
        this.mass = radius * radius; // 质量与半径平方成正比
        
        // 随机跳跃计时器
        this.jumpTimer = Math.random() * 200 + 100; // 100-300帧后随机跳跃
        this.jumpCounter = 0;
        
        // 添加到场景
        scene.add(this.mesh);
    }
    
    // 更新物理状态
    update() {
        if (isPaused) return;
        
        // 应用重力
        this.velocity.y -= gravity * 0.1;
        
        // 应用摩擦力
        this.velocity.multiplyScalar(friction);
        
        // 更新位置
        this.mesh.position.add(this.velocity);
        
        // 边界碰撞检测和反弹
        this.checkBoundaryCollision();
        
        // 随机跳跃逻辑
        this.jumpCounter++;
        if (this.jumpCounter >= this.jumpTimer) {
            this.randomJump();
            this.jumpCounter = 0;
            this.jumpTimer = Math.random() * 300 + 150; // 重置跳跃计时器
        }
        
        // 小球之间的碰撞检测
        this.checkBallCollisions();
    }
    
    // 边界碰撞检测
    checkBoundaryCollision() {
        const pos = this.mesh.position;
        
        // X轴边界
        if (pos.x + this.radius > BOUNDARY.x || pos.x - this.radius < -BOUNDARY.x) {
            this.velocity.x *= -bounce;
            pos.x = Math.max(-BOUNDARY.x + this.radius, Math.min(BOUNDARY.x - this.radius, pos.x));
        }
        
        // Y轴边界（地面和天花板）
        if (pos.y - this.radius < -BOUNDARY.y) {
            this.velocity.y = Math.abs(this.velocity.y) * bounce;
            pos.y = -BOUNDARY.y + this.radius;
        }
        if (pos.y + this.radius > BOUNDARY.y) {
            this.velocity.y = -Math.abs(this.velocity.y) * bounce;
            pos.y = BOUNDARY.y - this.radius;
        }
        
        // Z轴边界
        if (pos.z + this.radius > BOUNDARY.z || pos.z - this.radius < -BOUNDARY.z) {
            this.velocity.z *= -bounce;
            pos.z = Math.max(-BOUNDARY.z + this.radius, Math.min(BOUNDARY.z - this.radius, pos.z));
        }
    }
    
    // 随机跳跃
    randomJump() {
        // 只有当小球接近地面时才能跳跃
        if (this.mesh.position.y < -BOUNDARY.y + this.radius + 5) {
            this.velocity.y += Math.random() * 8 + 4; // 随机向上速度
            this.velocity.x += (Math.random() - 0.5) * 6; // 随机水平速度
            this.velocity.z += (Math.random() - 0.5) * 6; // 随机深度速度
        }
    }
    
    // 小球之间的碰撞检测
    checkBallCollisions() {
        for (let other of balls) {
            if (other === this) continue;
            
            const distance = this.mesh.position.distanceTo(other.mesh.position);
            const minDistance = this.radius + other.radius;
            
            if (distance < minDistance) {
                // 计算碰撞方向
                const direction = new THREE.Vector3()
                    .subVectors(this.mesh.position, other.mesh.position)
                    .normalize();
                
                // 分离小球
                const overlap = minDistance - distance;
                const separation = direction.clone().multiplyScalar(overlap * 0.5);
                this.mesh.position.add(separation);
                other.mesh.position.sub(separation);
                
                // 计算碰撞后的速度（简化的弹性碰撞）
                const relativeVelocity = new THREE.Vector3()
                    .subVectors(this.velocity, other.velocity);
                const speed = relativeVelocity.dot(direction);
                
                if (speed < 0) continue; // 小球正在分离
                
                const impulse = 2 * speed / (this.mass + other.mass);
                const impulseVector = direction.clone().multiplyScalar(impulse);
                
                this.velocity.sub(impulseVector.clone().multiplyScalar(other.mass));
                other.velocity.add(impulseVector.clone().multiplyScalar(this.mass));
                
                // 添加一些随机性
                this.velocity.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    Math.random() * 2,
                    (Math.random() - 0.5) * 2
                ));
            }
        }
    }
}

// 初始化场景
function initScene() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(70, 30, 70);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // 创建轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光照
    addLights();
    
    // 创建场景边界
    createBoundary();
    
    // 创建十五个小球
    createBalls();
    
    // 开始动画循环
    animate();
}

// 添加光照
function addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // 主光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // 点光源
    const pointLight = new THREE.PointLight(0xff6b6b, 0.6, 100);
    pointLight.position.set(-30, 30, 30);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x6bb6ff, 0.6, 100);
    pointLight2.position.set(30, 30, -30);
    scene.add(pointLight2);
}

// 创建场景边界
function createBoundary() {
    // 地面
    const floorGeometry = new THREE.PlaneGeometry(BOUNDARY.x * 2, BOUNDARY.z * 2);
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -BOUNDARY.y;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // 创建边界线框
    const boundaryGeometry = new THREE.BoxGeometry(BOUNDARY.x * 2, BOUNDARY.y * 2, BOUNDARY.z * 2);
    const boundaryMaterial = new THREE.MeshBasicMaterial({
        color: 0x34495e,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const boundaryMesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    scene.add(boundaryMesh);
}

// 创建十五个小球
function createBalls() {
    balls = [];
    const colors = [
        0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57,
        0xff9ff3, 0x54a0ff, 0x5f27cd, 0x00d2d3, 0xff9f43,
        0x10ac84, 0xee5a24, 0x0984e3, 0x6c5ce7, 0xa55eea
    ];
    
    for (let i = 0; i < 15; i++) {
        const radius = Math.random() * 2 + 1; // 半径1-3
        const x = (Math.random() - 0.5) * (BOUNDARY.x * 1.5);
        const y = Math.random() * 30 + 10; // 在空中开始
        const z = (Math.random() - 0.5) * (BOUNDARY.z * 1.5);
        const color = colors[i];
        
        const ball = new Ball(x, y, z, radius, color);
        ball.mesh.castShadow = true;
        ball.mesh.receiveShadow = true;
        balls.push(ball);
    }
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 更新控制器
    controls.update();
    
    // 更新所有小球
    balls.forEach(ball => ball.update());
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 重置场景
function resetScene() {
    // 清除现有小球
    balls.forEach(ball => {
        scene.remove(ball.mesh);
        ball.geometry.dispose();
        ball.material.dispose();
    });
    
    // 重新创建小球
    createBalls();
}

// 切换暂停状态
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 窗口大小调整
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 事件监听器
function setupEventListeners() {
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
    
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', resetScene);
    
    // 暂停按钮
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    
    // 重力滑块
    const gravitySlider = document.getElementById('gravitySlider');
    const gravityValue = document.getElementById('gravityValue');
    gravitySlider.addEventListener('input', (e) => {
        gravity = parseFloat(e.target.value);
        gravityValue.textContent = gravity.toFixed(1);
    });
    
    // 弹性滑块
    const bounceSlider = document.getElementById('bounceSlider');
    const bounceValue = document.getElementById('bounceValue');
    bounceSlider.addEventListener('input', (e) => {
        bounce = parseFloat(e.target.value);
        bounceValue.textContent = bounce.toFixed(1);
    });
    
    // 键盘控制
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                togglePause();
                break;
            case 'KeyR':
                resetScene();
                break;
        }
    });
}

// 初始化应用
function init() {
    initScene();
    setupEventListeners();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);