import {
  EventDispatcher, WebGLRenderer, Color,Clock,AmbientLight, DirectionalLight, PerspectiveCamera, Scene, Group, Vector3,  BoxGeometry, Mesh,MeshBasicMaterial
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
// import { GlbLoader,LOAD_EVENT } from './glbLoader';
import TWEEN, { Tween } from 'three/examples/jsm/libs/tween.module.js';
import { GlbLoader } from './glbLoader';

/**
 * 版本
 */
export const VER = '1.0';
/**
* 事件
*/
export const EVENT = {
   RUNNING: 'running',
   GAME_INIT: 'gameInit',
   GAME_START: 'gameStart',
   LOADING: 'modelLoading',
   LOADED: 'modelLoaded',
   LOAD_FAIL: 'modelLoadFail',
   GAME_OVER: 'gameOver'
};
const Static = {
  X: 0,
  Y: 0,
  WIDTH: 0,
  HEIGHT: 0,
  DURATION: 1600,
  CAMERA_FAR: 50
};

export class Platform extends EventDispatcher {
  _canvas:any = null;
  __camera:PerspectiveCamera; // 摄像头
  __scene:Scene; // 场景
  __bg:Group; //背景
  __boothes:Group; // 展位
  __renderer:any = null; // 渲染器
  _loader:any = null; // 加载器
  _config:any;// 配置信息
  _box:BoxGeometry; //立方体几何信息
  _cube:Mesh;//测试立方体
  _controls:any;//相机控制器

  _clock = new Clock();

  constructor() {
    super();
    this.__scene = new Scene();
    this.__scene.background = new Color(0xffffff);
    this.__camera = new PerspectiveCamera(75, Static.WIDTH / Static.HEIGHT, 1, 10000);
    this.__camera.position.set(5,5,5)
    this.__camera.lookAt(new Vector3(0,0,0));
    this.__bg = new Group();
    this.__boothes = new Group();
   this._box = new BoxGeometry(1,1,1)
   this._cube = new Mesh(this._box,new MeshBasicMaterial({
    color:0x00ff00
   }))
    this.__scene.add(
      this.__bg,
      this.__boothes,
      this.getLights(),
      this.__camera,
      this._cube
      
    );
  }
  /**
   * 装载
   * @param canvas 元素
   */
  freight(canvas:HTMLCanvasElement) {
    this._canvas = canvas;
    this.__renderer = new WebGLRenderer({ canvas, antialias: true });
		this.__renderer.shadowMap.enabled = true;
    window.addEventListener('resize', this.onResize);
  
    this.onResize();
    this.animate(0);
  }
  controlCamera(){
    this._controls = new OrbitControls(this.__camera,this.__renderer.domElement)
  }
  //尺寸重置
  onResize = () => {
    Static.X = this._canvas?.offsetLeft;
    Static.Y = this._canvas?.offsetTop;
    if(this._canvas) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;        
    }
    Static.WIDTH = window.innerWidth;
    Static.HEIGHT = window.innerHeight;
    
    if(this.__camera) {
      this.__camera.aspect = Static.WIDTH / Static.HEIGHT;
      this.__camera.updateProjectionMatrix();
      this.__renderer.setSize( Static.WIDTH, Static.HEIGHT );
      this.__renderer.setPixelRatio(window.devicePixelRatio);
    }
  }
 //准备动画
  ready() {
    this.__camera.position.set(1,1,1)
    this.__camera.lookAt(new Vector3(0,0,0));
    const v = new Vector3();
    v.x = 7;
    v.y = 7;
    v.z = 7;

    const t = new Tween(this.__camera.position).to(v, Static.DURATION);
    t.onUpdate(() => {
      this.__camera.lookAt(new Vector3(0,0,0));
    });
    t.onComplete(() => {
      this.controlCamera();
      this.boothInit();
    })
    t.start();
  }
  start(){
    this.ready();
   
  }

  boothInit(){
      const g = new GlbLoader();
      this.__boothes.add(g);
  }

  getLights() {
    const group = new Group();
    const sun = new DirectionalLight(0xffffff, 0.8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = -180;
    sun.shadow.camera.bottom = 180;
    sun.position.set(50, 50, 0);
    group.add(
      new AmbientLight(0xffffff, 0.6),
      sun
    );
    return group;
  }
  /**
   * 动画
   */
  animate = (time:number)=> {
    requestAnimationFrame(this.animate);
    if(this._controls) this._controls.update();
    this.__renderer.render(this.__scene, this.__camera);
    TWEEN.update(time);
  }
}

