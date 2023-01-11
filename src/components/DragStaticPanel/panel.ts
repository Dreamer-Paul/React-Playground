import { MouseEvent, TouchEvent } from "react";

export const isMobile = navigator.userAgent.toLocaleLowerCase().includes("mobi");

export const eventName = {
  up: isMobile ? "touchend" : "mouseup",
  down: isMobile ? "touchstart" : "mousedown",
  move: isMobile ? "touchmove" : "mousemove"
};

interface IProps {
  wrapper: HTMLElement
  overlay: HTMLElement
}

interface IObj {
  wrapper?: HTMLElement
  overlay?: HTMLElement
}

export class Panel {
  private obj: IObj = {
    wrapper: undefined,
    overlay: undefined
  }

  private state = {
    draggable: false,
    // 点击位置坐标
    location: {
      x: -1,
      y: -1
    },
    // 容器坐标
    translate: {
      x: -1,
      y: -1
    }
  }

  constructor({ wrapper, overlay }: IProps) {
    this.obj.wrapper = wrapper;
    this.obj.overlay = overlay;

    this.initWrapper();
    this.initWindowResizeCheck();
  }

  public destroy = () => {
    this.destroyWrapper();
    this.destroyWindowResizeCheck();
  }

  // 静态转拖拽
  public staticToFixed = (offsetProps = {}) => {
    if (!this.obj.wrapper) return;

    this.state.draggable = true;

    const offset = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      ...offsetProps
    };

    const { wrapper } = this.obj;

    wrapper.style.top = "0";
    wrapper.style.left = "0";

    const x = wrapper.offsetLeft + offset.x;
    const y = wrapper.offsetTop + offset.y;

    wrapper.style.transform = `translate(${x}px, ${y}px)`;

    this.state.translate.x = x;
    this.state.translate.y = y;

    const w = wrapper.clientWidth + offset.width;
    const h = wrapper.clientHeight + offset.height;

    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
    wrapper.style.position = "fixed";
  }

  // 拖拽转静态
  public fixedToStatic = () => {
    if (!this.obj.wrapper) return;

    this.state.draggable = false;

    const { wrapper } = this.obj;

    wrapper.style.top = "";
    wrapper.style.left = "";
    wrapper.style.width = "";
    wrapper.style.height = "";
    wrapper.style.position = "";
    wrapper.style.transform = "";
  }

  public toggle = (offsetProps = {}) => {
    if (this.state.draggable) {
      this.fixedToStatic();
    }
    else {
      this.staticToFixed(offsetProps);
    }
  }

  private onUp = () => {
    const { wrapper, overlay } = this.obj;

    if (!wrapper || !overlay) return;

    wrapper.style.userSelect = "";
    overlay.classList.remove("active");

    document.removeEventListener(eventName.move, this.onMove);
    document.removeEventListener(eventName.up, this.onUp);
  }

  private onMove = (e: unknown) => {
    const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

    const { wrapper } = this.obj;

    if (!wrapper) return;

    window.requestAnimationFrame(() => {
      // 移动的时候拿到的坐标是鼠标的（较大）减去按下前鼠标距离元素 xy 的距离
      let x = 0;
      let y = 0;

      if ("touches" in ev) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
      }
      else {
        x = ev.clientX;
        y = ev.clientY;
      }

      x = x - this.state.location.x;
      y = y - this.state.location.y;

      if (x <= 0) {
        x = 0;
      }
      if (y <= 0) {
        y = 0;
      }

      const maxX = window.innerWidth - wrapper.clientWidth;
      const maxY = window.innerHeight - wrapper.clientHeight;

      if (x >= maxX) {
        x = maxX;
      }
      if (y >= maxY) {
        y = maxY;
      }

      this.state.translate.x = x;
      this.state.translate.y = y;

      wrapper.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  private onDown = (e: unknown) => {
    const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

    const { wrapper, overlay } = this.obj;

    if (!wrapper || !overlay) return;

    if (!this.state.draggable) return;

    if (ev.target !== wrapper) return;

    ev.preventDefault();

    wrapper.style.userSelect = "none";
    overlay.classList.add("active");

    let x = 0;
    let y = 0;

    if ("touches" in ev) {
      x = ev.touches[0].clientX;
      y = ev.touches[0].clientY;
    }
    else {
      x = ev.clientX;
      y = ev.clientY;
    }

    // 记录按下前的坐标
    this.state.location.x = x - this.state.translate.x;
    this.state.location.y = y - this.state.translate.y;

    document.addEventListener(eventName.move, this.onMove);
    document.addEventListener(eventName.up, this.onUp);
  }

  // 绑定 Wrapper 操作
  private initWrapper = () => {
    const { wrapper, overlay } = this.obj;

    if (!wrapper || !overlay) return;

    wrapper.addEventListener(eventName.down, this.onDown);
  }

  private destroyWrapper = () => {
    const { wrapper, overlay } = this.obj;

    if (!wrapper || !overlay) return;

    wrapper.addEventListener(eventName.down, this.onDown);
  }

  // 节流后的 Window Resize 检测
  private onWindowResizeFrame = () => {
    if (!this.obj.wrapper || !this.state.draggable) return;

    const { wrapper } = this.obj;

    let x = this.state.translate.x;
    let y = this.state.translate.y;
    let w = wrapper.clientWidth;
    let h = wrapper.clientHeight;

    if (w >= window.innerWidth) {
      w = window.innerWidth;
    }

    if (h >= window.innerHeight) {
      h = window.innerHeight;
    }

    if ((x + w) >= window.innerWidth) {
      x = window.innerWidth - w;
    }

    if ((y + h) >= window.innerHeight) {
      y = window.innerHeight - h;
    }

    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
    wrapper.style.transform = `translate(${x}px, ${y}px)`;

    this.state.translate.x = x;
    this.state.translate.y = y;
  }

  // Resize 检测
  private onWindowResize() {
    window.requestAnimationFrame(this.onWindowResizeFrame);
  }
  private onWindowResizeBinded = this.onWindowResize.bind(this);

  private initWindowResizeCheck() {
    window.addEventListener("resize", this.onWindowResizeBinded);
  }

  private destroyWindowResizeCheck() {
    window.removeEventListener("resize", this.onWindowResizeBinded);
  }
}
