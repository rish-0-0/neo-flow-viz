"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_1 = require("@xyflow/react");
const const_1 = require("./const");
const utils_1 = require("./utils");
const BORDER_WIDTH = 4; // in px
const CircularNode = ({ data: { label } }) => {
    const bgColor = (0, utils_1.getColorFromLabel)(label);
    const darkened = (0, utils_1.darkenColor)(bgColor, 0.3);
    return (<div style={{
            width: const_1.DEFAULT_NODE_WIDTH - BORDER_WIDTH,
            height: const_1.DEFAULT_NODE_HEIGHT - BORDER_WIDTH,
            borderRadius: '50%',
            backgroundColor: bgColor,
            borderColor: darkened,
            borderWidth: BORDER_WIDTH / 2, // personal choice
            borderStyle: 'solid',
            color: (0, utils_1.getContrastColor)(bgColor),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12, // personal choice
            textAlign: 'center',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
        }} className='neo-flow-viz-circular-node'>
      {label}
      {/* Input and Output Handles */}
      <react_1.Handle type="target" position={react_1.Position.Top}/>
      <react_1.Handle type="source" position={react_1.Position.Bottom}/>
    </div>);
};
exports.default = CircularNode;
