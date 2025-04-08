import GameCanvas from "~/components/GameCanvas";
import type { Route } from "./+types/home";
import GameBoard from "~/components/GameBoard";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return <GameBoard />;
}
