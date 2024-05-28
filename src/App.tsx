import FlexContainer from "./components/FlexContainer";
import NextButton from "./components/NextButton";

function App() {
  return (
    <FlexContainer variant="row-center" className="h-screen w-full">
      <NextButton href="/capture" colorScheme="primary">
        Capture Photo
      </NextButton>
    </FlexContainer>
  );
}
export default App;
