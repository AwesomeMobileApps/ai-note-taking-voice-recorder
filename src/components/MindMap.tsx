import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { extractKeyTopics } from '../utils/summarization';

// Define node types for the mind map
interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
}

interface MindMapProps {
  content: string;
  title: string;
}

/**
 * MindMap component for visualizing note content
 * Creates a hierarchical visualization of the note's key topics
 */
const MindMap: React.FC<MindMapProps> = ({ content, title }) => {
  // Extract topics from content
  const topics = extractKeyTopics(content, 5);
  
  // Create a simple mind map structure
  const rootNode: MindMapNode = {
    id: 'root',
    text: title,
    children: topics.map((topic, index) => ({
      id: `topic-${index}`,
      text: topic,
    })),
  };
  
  // Render the mind map
  return (
    <ScrollView horizontal style={styles.container}>
      <View style={styles.mindMapContainer}>
        {/* Root node */}
        <View style={styles.rootNodeContainer}>
          <View style={styles.rootNode}>
            <Text style={styles.rootNodeText}>{rootNode.text}</Text>
          </View>
          
          {/* Branches and child nodes */}
          <View style={styles.childrenContainer}>
            {rootNode.children?.map((child, index) => (
              <View key={child.id} style={styles.branchContainer}>
                <View style={styles.branch} />
                <View 
                  style={[
                    styles.childNode,
                    { backgroundColor: nodeColors[index % nodeColors.length] }
                  ]}
                >
                  <Text style={styles.childNodeText}>{child.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Colors for different nodes
const nodeColors = [
  '#6200ee', // Purple
  '#03dac6', // Teal
  '#ff6e40', // Deep Orange
  '#ffab00', // Amber
  '#2979ff', // Blue
  '#00c853', // Green
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mindMapContainer: {
    padding: 20,
    alignItems: 'center',
    minWidth: '100%',
  },
  rootNodeContainer: {
    alignItems: 'center',
  },
  rootNode: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 24,
    minWidth: 150,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  rootNodeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  childrenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    width: '100%',
  },
  branchContainer: {
    alignItems: 'center',
    margin: 10,
    position: 'relative',
  },
  branch: {
    width: 2,
    height: 30,
    backgroundColor: '#ccc',
    position: 'absolute',
    top: -30,
  },
  childNode: {
    padding: 12,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  childNodeText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MindMap; 