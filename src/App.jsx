import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h1>Carregando...</h1>
      </div>
    );
  }

  if (!user) {
    return <h1>Tela de Login Aqui</h1>; // Substituiremos por um componente de Login
  }

  return (
    <div>
      <h1>Calendário Financeiro</h1>
      <p>Bem-vindo, {user.email}!</p>
    </div>
  );
}

export default App;
