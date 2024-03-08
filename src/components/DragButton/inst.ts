import type { MouseEvent, TouchEvent } from "react";

export const isMobile = navigator.userAgent.toLocaleLowerCase().includes("mobi");

export const eventName = {
  up: isMobile ? "touchend" : "mouseup",
  down: isMobile ? "touchstart" : "mousedown",
  move: isMobile ? "touchmove" : "mousemove"
};

interface IProps {
  wrapper: HTMLElement
  overlay: HTMLElement
  initialY?: number;
}

interface IObj {
  wrapper?: HTMLElement
  overlay?: HTMLElement
}

export default class DragButton {
  private obj: IObj = {
    wrapper: undefined,
    overlay: undefined,
  }

  private state = {
    // onMouseDown 鼠标在容器内坐标
    prevMouseOnWrapY: -1,
    // onMouseDown 时的容器坐标
    prevWrapY: -1,
    // 容器坐标
    wrapY: -1,
  }

  public isMoved = false;

  constructor({ wrapper, overlay, initialY }: IProps) {
    this.obj.wrapper = wrapper;
    this.obj.overlay = overlay;

    if (initialY && initialY >= 0) {
      this.setPositionY(initialY);
    }

    this.wrapperMove.init();
    this.windowResizeCheck.init();
  }

  public destroy = () => {
    this.wrapperMove.destroy();
    this.windowResizeCheck.destroy();
  }

  // 修改容器坐标
  public setPositionY = (y: number) => {
    const { wrapper } = this.obj;

    if (!wrapper) return;

    this.state.wrapY = y;

    wrapper.style.transform = `translateY(${y}px)`;
  }


  // 窗口尺寸可能变化的情况下，重新计算坐标和尺寸
  private fixPositionAndSize = () => {
    if (!this.obj.wrapper) {
      return;
    }

    let y = this.state.wrapY;
    let h = this.obj.wrapper.clientHeight;

    if ((y + h) >= window.innerHeight) {
      y = window.innerHeight - h;
    }

    this.setPositionY(y);
  }

  /**
   * 获取当前指针位置
   * @param ev 触摸或鼠标事件
   * @returns 
   */
  private getPointerPosition = (ev: TouchEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
    let y = 0;

    if ("touches" in ev) {
      y = ev.touches[0].clientY;
    }
    else {
      y = ev.clientY;
    }

    return y;
  }

  //
  // 拖拽功能
  //
  private wrapperMove = {
    /**
     * 初始化容器缩放功能
     */
    init: () => {
      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      wrapper.addEventListener(eventName.down, this.wrapperMove.onDown);
    },
    /**
     * 销毁容器拖拽功能
     */
    destroy: () => {
      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      wrapper.removeEventListener(eventName.down, this.wrapperMove.onDown);
    },
    /**
     * 鼠标弹起
     * @description 释放事件
     */
    onUp: () => {
      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      wrapper.style.userSelect = "";
      overlay.classList.remove("active");

      document.removeEventListener(eventName.move, this.wrapperMove.onMove);
      document.removeEventListener(eventName.up, this.wrapperMove.onUp);

      this.isMoved = this.state.prevWrapY !== this.state.wrapY;
    },
    /**
     * 鼠标按下
     * @description 记录按下的位置
     */
    onDown: (e: unknown) => {
      const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

      const { wrapper, overlay } = this.obj;

      if (!wrapper || !overlay) return;

      ev.preventDefault();

      wrapper.style.userSelect = "none";
      overlay.classList.add("active");

      const y = this.getPointerPosition(ev);

      // 记录按下前鼠标在容器内的位置
      this.state.prevMouseOnWrapY = y - this.state.wrapY;
      // 记录按下前容器的位置
      this.state.prevWrapY = this.state.wrapY;

      document.addEventListener(eventName.move, this.wrapperMove.onMove);
      document.addEventListener(eventName.up, this.wrapperMove.onUp);

      this.isMoved = false;
    },
    /**
     * 鼠标移动
     * @description 绑定事件
     */
    onMove: (e: unknown) => {
      const ev = e as TouchEvent<HTMLElement> | MouseEvent<HTMLElement>;

      const { wrapper } = this.obj;

      if (!wrapper) return;

      window.requestAnimationFrame(() => {
        // 移动的时候拿到的坐标是鼠标的（较大）减去按下前鼠标距离元素 xy 的距离
        let y = this.getPointerPosition(ev);

        y = y - this.state.prevMouseOnWrapY;

        if (y <= 0) {
          y = 0;
        }

        const maxY = window.innerHeight - wrapper.clientHeight;

        if (y >= maxY) {
          y = maxY;
        }

        this.setPositionY(y);
      });
    }
  }

  //
  // 浏览器窗口调整检测
  //
  private windowResizeCheck = {
    onResizeFrame: () => {
      if (!this.obj.wrapper) return;

      this.fixPositionAndSize();
    },
    onResize: () => {
      window.requestAnimationFrame(this.windowResizeCheck.onResizeFrame);
    },
    init: () => {
      window.addEventListener("resize", this.windowResizeCheck.onResize);
    },
    destroy: () => {
      window.removeEventListener("resize", this.windowResizeCheck.onResize);
    },
  }
}
