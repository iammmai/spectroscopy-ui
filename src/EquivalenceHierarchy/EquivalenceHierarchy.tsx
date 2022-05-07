import styled from "styled-components";
import { ReactComponent as EquivalenceSvg } from "./equivalenceHierarchy.svg";

const LIGHT_LIGHT_GREY = "#ededed";
const LIGHT_GREY = "#d4d4d4";
const MID_GREY = "#9c9c9c";

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// const StyledSvg = styled(EquivalenceSvg)`
//   fill:
// `;

const EquivalenceHierarchy = ({
  equivalences,
}: {
  equivalences?: string[];
}) => {
  return (
    // <OuterContainer>
    //   <Row>
    //     <Block color={LIGHT_GREY}>Bisimulation</Block>
    //   </Row>
    //   <Row color={MID_GREY}>
    //     <Block color={MID_GREY}>2-nested simulation</Block>
    //   </Row>
    //   <Row>
    //     <Block color={LIGHT_LIGHT_GREY} width="140%">
    //       ready simulation
    //     </Block>
    //     <Block color={MID_GREY} />
    //   </Row>
    //   <Row>
    //     <Block width="70%">simulation</Block>
    //     <Block color={MID_GREY} width="70%">
    //       ready traces
    //     </Block>
    //     <Block color={LIGHT_GREY}>possible futures</Block>
    //   </Row>
    //   <Row>
    //     {" "}
    //     <Row>
    //       <Block>simulation</Block>
    //       <Block color={MID_GREY}>failure traces</Block>
    //       <Block color={LIGHT_GREY}>readies</Block>
    //       <Block color={LIGHT_GREY}>impossible futures</Block>
    //     </Row>
    //   </Row>
    //   <Row>
    //     <Block>simulation</Block>
    //     <Block color={MID_GREY}>failures</Block>
    //   </Row>
    //   <Row>traces</Row>
    // </OuterContainer>
    <EquivalenceSvg />
  );
};

export default EquivalenceHierarchy;
