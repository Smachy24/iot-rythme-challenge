import { NavLink } from "react-router";
import { Button } from "~/components/Button";
import { Title } from "~/components/Title";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 items-center justify-center ">
      <Title>Rythme Challenge</Title>
      <NavLink to="/game">
        <Button>Insert Coin</Button>
      </NavLink>
    </div>
  );
}
