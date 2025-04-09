import { NavLink } from "react-router";

export default function Home() {
    return (
        <div>
            <h1 className="text-4xl">Rythme Challenge</h1>
            <NavLink to="/game">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Start Game
                </button>
            </NavLink>
        </div>
    );
}
