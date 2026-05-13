#!/usr/bin/env python3
"""
Script to filter out airports not in the largest strongly connected component (SCC).
A strongly connected component is a maximal set of nodes where every node is reachable
from every other node, representing the biggest fully connected directed graph.
"""

import pandas as pd
import networkx as nx
from pathlib import Path


def filter_routes_by_largest_scc(input_file, output_file=None):
    """
    Filter routes to keep only airports in the largest strongly connected component.
    
    Args:
        input_file (str): Path to the input Routes.txt file
        output_file (str): Path to output file. If None, uses input_file with '_filtered' suffix
    
    Returns:
        dict: Statistics about the filtering
    """
    
    # Read the routes file
    print(f"Reading routes from {input_file}...")
    df = pd.read_csv(input_file)
    
    print(f"Initial routes: {len(df)}")
    print(f"Initial unique airports: {len(set(df['source_airport'].unique()) | set(df['destination_airport'].unique()))}")
    
    # Create directed graph
    print("\nBuilding directed graph...")
    G = nx.DiGraph()
    
    # Add edges from routes
    for _, row in df.iterrows():
        src = row['source_airport']
        dst = row['destination_airport']
        # Skip rows with missing airport codes
        if pd.notna(src) and pd.notna(dst):
            G.add_edge(src, dst)
    
    print(f"Graph nodes (airports): {G.number_of_nodes()}")
    print(f"Graph edges (routes): {G.number_of_edges()}")
    
    # Find all strongly connected components
    print("\nFinding strongly connected components...")
    sccs = list(nx.strongly_connected_components(G))
    print(f"Number of strongly connected components: {len(sccs)}")
    
    # Find the largest SCC
    largest_scc = max(sccs, key=len)
    print(f"\nLargest SCC size: {len(largest_scc)}")
    print(f"Airports in largest SCC: {sorted(largest_scc)}")
    
    # Print info about other SCCs
    other_sccs = sorted([scc for scc in sccs if scc != largest_scc], key=len, reverse=True)
    if other_sccs:
        print(f"\nOther SCCs (first 5):")
        for i, scc in enumerate(other_sccs[:5]):
            print(f"  SCC {i+1}: {len(scc)} airports - {sorted(scc)}")
    
    # Filter dataframe to keep only routes between airports in the largest SCC
    print("\nFiltering routes...")
    filtered_df = df[
        (df['source_airport'].isin(largest_scc)) & 
        (df['destination_airport'].isin(largest_scc))
    ].copy()
    
    print(f"Routes after filtering: {len(filtered_df)}")
    
    # Write output
    if output_file is None:
        output_file = input_file.replace('.txt', '_filtered.txt')
    
    print(f"\nWriting filtered routes to {output_file}...")
    filtered_df.to_csv(output_file, index=False)
    
    # Calculate statistics
    initial_airports = len(set(df['source_airport'].unique()) | set(df['destination_airport'].unique()))
    stats = {
        'initial_routes': len(df),
        'initial_airports': initial_airports,
        'final_routes': len(filtered_df),
        'final_airports': len(largest_scc),
        'routes_removed': len(df) - len(filtered_df),
        'airports_removed': initial_airports - len(largest_scc),
        'largest_scc_size': len(largest_scc),
        'num_sccs': len(sccs)
    }
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Initial routes: {stats['initial_routes']}")
    print(f"Final routes: {stats['final_routes']}")
    print(f"Routes removed: {stats['routes_removed']} ({100*stats['routes_removed']/stats['initial_routes']:.1f}%)")
    print(f"\nInitial airports: {stats['initial_airports']}")
    print(f"Final airports (in largest SCC): {stats['final_airports']}")
    print(f"Airports removed: {stats['airports_removed']} ({100*stats['airports_removed']/stats['initial_airports']:.1f}%)")
    print(f"\nLargest SCC size: {stats['largest_scc_size']}")
    print(f"Total SCCs found: {stats['num_sccs']}")
    print("="*50)
    
    return stats


if __name__ == "__main__":
    # Get the script's directory
    script_dir = Path(__file__).parent
    input_file = script_dir / "Routes.txt"
    output_file = script_dir / "Routes_filtered.txt"
    
    if not input_file.exists():
        print(f"Error: {input_file} not found!")
        exit(1)
    
    filter_routes_by_largest_scc(str(input_file), str(output_file))
    print(f"\n✓ Filtered routes saved to {output_file}")
