import * as React from 'react';
import { Handle, Position } from '@xyflow/react';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from './const';
import { darkenColor, getColorFromLabel, getContrastColor } from './utils';

const BORDER_WIDTH = 4; // in px

const CircularNode = ({ data: {label} }: {data: {label: string;}}) => {
  const bgColor = getColorFromLabel(label);
  const darkened = darkenColor(bgColor, 0.3);
  return (
    <div style={{
      width: DEFAULT_NODE_WIDTH - BORDER_WIDTH,
      height: DEFAULT_NODE_HEIGHT - BORDER_WIDTH,
      borderRadius: '50%',
      backgroundColor: bgColor,
      borderColor: darkened,
      borderWidth: BORDER_WIDTH / 2, // personal choice
      borderStyle: 'solid',
      color: getContrastColor(bgColor),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12, // personal choice
      textAlign: 'center',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
    }} className='neo-flow-viz-circular-node'>
      {label}
      {/* Input and Output Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CircularNode;