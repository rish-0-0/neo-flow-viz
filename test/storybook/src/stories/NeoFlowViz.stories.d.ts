import type { StoryObj } from '@storybook/react';
import NeoFlowViz from 'neo-flow-viz/src/NeoFlowViz';
declare const meta: {
    title: string;
    tags: string[];
    component: typeof NeoFlowViz;
    parameters: {
        layout: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Basic: Story;
export declare const NoRelation: Story;
export declare const Relationships: Story;
