import { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [num, setNum] = useState(101);
	return <span onClickCapture={() => setNum(num + 1)}>{num}</span>;
};

const Child = () => {
	return <span>{num}</span>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
