export const ItemState = {
    Normal: 1,
    Hover: 2,
    Selected: 3
}
export const ConnectorType = {
    Attachable: 1,  // can be attached with other connectors  -- shape connector
    Endpoint: 2,   // line's from or to point
    RightAngle: 3,  //in the poly line
    Middle: 4   //in the line
};
export const AttachType = {
    None: 0,
    Out: 1,
    In: 2,
    Both: 3,
};
export const LineType = {
    Straight: 1,
    RightAngle: 2
};