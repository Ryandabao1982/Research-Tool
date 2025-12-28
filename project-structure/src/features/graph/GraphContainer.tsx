import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Note, Link } from '../../shared/types';

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    title: string;
    isCenter?: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
}

interface GraphContainerProps {
    notes: Note[];
    links: Link[];
    onNodeClick: (id: string) => void;
}

export function GraphContainer({ notes, links, onNodeClick }: GraphContainerProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const data = useMemo(() => {
        const d3Nodes: GraphNode[] = notes.map(n => ({ id: n.id, title: n.title }));
        const d3Links: GraphLink[] = links.map(l => ({
            source: l.source_note_id,
            target: l.target_note_id
        }));
        return { nodes: d3Nodes, links: d3Links };
    }, [notes, links]);

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length) return;

        const svg = d3.select(svgRef.current);
        const width = svg.node()?.getBoundingClientRect().width || 800;
        const height = svg.node()?.getBoundingClientRect().height || 600;

        svg.selectAll('*').remove();

        const g = svg.append('g');

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Simulation setup
        const simulation = d3.forceSimulation<GraphNode>(data.nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(40));

        // Links
        const link = g.append('g')
            .selectAll('line')
            .data(data.links)
            .enter().append('line')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-width', 1.5);

        // Nodes
        const node = g.append('g')
            .selectAll('.node')
            .data(data.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag<SVGGElement, GraphNode>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
            )
            .on('click', (event, d) => onNodeClick(d.id));

        // Node circles (Atmospheric glow)
        node.append('circle')
            .attr('r', 6)
            .attr('fill', '#3b82f6')
            .attr('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))');

        // Node labels
        node.append('text')
            .text(d => d.title)
            .attr('x', 12)
            .attr('y', 4)
            .attr('fill', 'rgba(255, 255, 255, 0.6)')
            .attr('font-size', '10px')
            .attr('font-weight', '500')
            .attr('pointer-events', 'none');

        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as GraphNode).x!)
                .attr('y1', d => (d.source as GraphNode).y!)
                .attr('x2', d => (d.target as GraphNode).x!)
                .attr('y2', d => (d.target as GraphNode).y!);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event: any, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: GraphNode) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => simulation.stop();
    }, [data, onNodeClick]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />
    );
}
