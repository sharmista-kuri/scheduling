def generate_graph(prereq_list):
    """
    Input: Array of tuples from the prereq table in the form
    [prereq_course, main_course]

    Output: Hashmap containing the main_course as the key,
    and the list of it's prereqs as the value.
    """
    # Define output graph
    graph = {}
    for row in prereq_list:
        # Unpack the tuple
        prereq_course, main_course = row
        # Make sure the initial value is set for a new main course
        if main_course not in graph:
            graph[main_course] = []
        # Add the prereq course into the graph
        graph[main_course].append(prereq_course)
    return graph


def reverse_graph(input_graph):
    """
    Input: A hashmap graph of courses and their prereqs

    Output: A reversed order traversal where the items in the prereq list valeus are now the keys
    """
    graph = {}
    for main_course, prereq_list in input_graph.items():
        # Iterate over the prereq courses as our new keys
        for prereq_course in prereq_list:
            # Set the initial value of the prereq_course list
            if prereq_course not in graph:
                graph[prereq_course] = []
            # Add the main_course to the reversed list
            graph[prereq_course].append(main_course)
    return graph


def find_roots(graph):
    """
    Input: A hashmap graph of courses

    Output: The roots of the graph (courses with no incoming edges)
    """
    # Determine if incoming edge has been seen before, initialize to False
    seen_incoming = {}
    for node in graph:
        seen_incoming[node] = False

    # For every node, set all future nodes to having an incoming node
    for node in graph:
        for neighbor in graph[node]:
            seen_incoming[neighbor] = True

    roots = []
    for node, seen in seen_incoming.items():
        if not seen:
            roots.append(node)
    return roots


def calculate_depths(graph):
    """
    Input: A hashmap graph of courses and their prereqs

    Output: A hashmap containing a depth as the key and a list of courses at that depth as the value. A courses depth is determined by the minimum value found
    """
    # Keeps track of each course and the current depth of that course
    course_depth_pairs = {}
    # Queue used for DFS traversal
    queue = []
    # Roots for initializing all DFS's
    roots = find_roots(graph)
    for root in roots:
        # Initialize the DFS
        queue.append(root)
        # Initialize root depth to 0
        course_depth_pairs[queue[0]] = 0
        # Continually iterate over nodes until stack is empty, then move on to next root
        while len(queue) != 0:
            # Store the current top of stack
            current_node = queue[0]
            # Ensure the node is not a leaf node
            if current_node in graph:
                # Iterate over all future nodes, setting the depth to minimum of parent depth + 1 and their current depth
                for child_node in graph[current_node]:
                    # Update depth of next item in stack
                    if child_node not in course_depth_pairs:
                        course_depth_pairs[child_node] = (
                            course_depth_pairs[current_node] + 1
                        )
                    else:
                        course_depth_pairs[child_node] = min(
                            course_depth_pairs[current_node] + 1,
                            course_depth_pairs[child_node],
                        )
                    # Add child to queue
                    queue.append(child_node)
            # Remove current_node from queue
            queue.pop(0)

    # Based on course_depth_pairs, group all courses of same depth in lists stored in hashmap
    output = {}
    for course, depth in course_depth_pairs.items():
        # Initialize output list
        if depth not in output:
            output[depth] = []
        output[depth].append(course)
    return output


def debug_print_graph(graph):
    """
    Input: A hashmap graph of courses and their prereqs

    Output: A debug print showing the connections
    """
    for main_course, prereq_list in graph.items():
        print(main_course, prereq_list)
