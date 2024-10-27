import{r as a}from"./index-DJO9vBfz.js";var l={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f=a,m=Symbol.for("react.element"),_=Symbol.for("react.fragment"),c=Object.prototype.hasOwnProperty,y=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,d={key:!0,ref:!0,__self:!0,__source:!0};function u(o,r,s){var e,t={},i=null,p=null;s!==void 0&&(i=""+s),r.key!==void 0&&(i=""+r.key),r.ref!==void 0&&(p=r.ref);for(e in r)c.call(r,e)&&!d.hasOwnProperty(e)&&(t[e]=r[e]);if(o&&o.defaultProps)for(e in r=o.defaultProps,r)t[e]===void 0&&(t[e]=r[e]);return{$$typeof:m,type:o,key:i,ref:p,props:t,_owner:y.current}}n.Fragment=_;n.jsx=u;n.jsxs=u;l.exports=n;var R=l.exports;function v(o){throw new Error('Could not dynamically require "'+o+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}export{v as c,R as j};
