// React 19 の act() が見る印。テストの中でだけ立てる。
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

export {};
