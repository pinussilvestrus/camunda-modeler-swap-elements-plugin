import {
  find,
  filter,
  map,
  reduce
} from 'min-dash';

/**
 * Generates a copied version of an original connection element.
 *
 * @param {Connection} connection
 *
 * @return {CopiedConnection} copied connection.
 */
export function copyConnection(connection) {
  const copy = {
    ...connection,
    sourceId: connection.source.id,
    targetId: connection.target.id,
    parentId: connection.parent.id
  };

  delete copy.source;
  delete copy.target;
  delete copy.labels;

  return copy;
}

/**
   * Retrieves all copied connection from a given set which are going from
   * * A -> B
   * * B -> A
   *
   * @param {Array<Connection>} connections
   * @param {Shape} elementA
   * @param {Shape} elementB
   *
   * @return {Array<CopiedConnection>}
   */
export function copySharedConnections(connections, elementA, elementB) {
  const copiedConnections = filter(map(connections, c => copyConnection(c, elementA, elementB)), c => {
    return c && isSharedConnection(c, elementA, elementB);
  });

  // remove duplicates
  return reduce(copiedConnections, (unique, connection) => {
    if (find(unique, item => item.id === connection.id)) {
      return unique;
    } else {
      return [...unique, connection];
    }
  }, []);
}

/**
   * Retrieves all copied connection from a given set which are NOT going from
   * * A -> B
   * * B -> A
   *
   * @param {Array<Connection>} connections
   * @param {Shape} elementA
   * @param {Shape} elementB
   *
   * @return {Array<CopiedConnection>}
   */
export function copyUniqueConnections(connections, elementA, elementB) {
  return filter(map(connections, c => copyConnection(c, elementA, elementB)), c => {
    return c && !isSharedConnection(c, elementA, elementB);
  });
}

/**
   * Retrieves whether a (copied) connection goes from A -> B or B -> A
   *
   * @param {CopiedConnection} connection
   * @param {Shape} elementA
   * @param {Shape} elementB
   *
   * @return {Boolean}
   */
export function isSharedConnection(connection, elementA, elementB) {
  return connection.sourceId === elementA.id && connection.targetId === elementB.id ||
      connection.sourceId === elementB.id && connection.targetId === elementA.id;
}