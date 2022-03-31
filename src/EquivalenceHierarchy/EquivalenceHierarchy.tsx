import styled from "styled-components";

const LIGHT_LIGHT_GREY = "#ededed";
const LIGHT_GREY = "#d4d4d4";
const MID_GREY = "#9c9c9c";

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  height: 70px;
  width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.color || LIGHT_GREY};
`;

const Block = styled.div`
  height: 100%;
  background-color: ${(props) => props.color || LIGHT_GREY};
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
`;

const EquivalenceHierarchy = ({ equivalences }: { equivalences: string[] }) => {
  return (
    <OuterContainer>
      {/* <Row>
        <Block color={LIGHT_GREY}>Bisimulation</Block>
      </Row>
      <Row color={MID_GREY}>
        <Block color={MID_GREY}>2-nested simulation</Block>
      </Row>
      <Row>
        <Block color={LIGHT_LIGHT_GREY} width="140%">
          ready simulation
        </Block>
        <Block color={MID_GREY} />
      </Row>
      <Row>
        <Block width="70%">simulation</Block>
        <Block color={MID_GREY} width="70%">
          ready traces
        </Block>
        <Block color={LIGHT_GREY}>possible futures</Block>
      </Row>
      <Row>
        {" "}
        <Row>
          <Block>simulation</Block>
          <Block color={MID_GREY}>failure traces</Block>
          <Block color={LIGHT_GREY}>readies</Block>
          <Block color={LIGHT_GREY}>impossible futures</Block>
        </Row>
      </Row>
      <Row>
        <Block>simulation</Block>
        <Block color={MID_GREY}>failures</Block>
      </Row>
      <Row>traces</Row> */}
    </OuterContainer>
  );
};

export default EquivalenceHierarchy;
