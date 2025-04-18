import { Provider } from 'react-redux';
import LinkedListAnimation from './components/LinkedListAnimation';
import { store } from './store';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <LinkedListAnimation />
      </div>
    </Provider>
  );
}

export default App;
