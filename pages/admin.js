// pages/admin.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Admin.module.scss';

export default function AdminPage() {
  const [playerName, setPlayerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [players, setPlayers] = useState([]);
  // Nuevo estado para el modo de campeonato
  const [champMode, setChampMode] = useState('single'); // 'single' o 'double'

  useEffect(() => {
    const storedPlayers = localStorage.getItem('fifa25-players');
    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    }
  }, []);

  // Agregar jugador (usando URL en lugar de Base64)
  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    // Si no proporcionan URL, usamos una imagen por defecto.
    const newPlayer = {
      name: playerName.trim(),
      imageUrl: imageUrl.trim() || '/fifa-logo.png',
    };

    const newPlayers = [...players, newPlayer];
    localStorage.setItem('fifa25-players', JSON.stringify(newPlayers));
    setPlayers(newPlayers);

    // Limpiamos campos
    setPlayerName('');
    setImageUrl('');
  };

  // Eliminar jugador
  const handleRemovePlayer = (index) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    localStorage.setItem('fifa25-players', JSON.stringify(newPlayers));
    setPlayers(newPlayers);
  };

  /**
   * Generar Round-Robin simple ("Normal"):
   * Si hay N jugadores, se generan N*(N-1)/2 partidos.
   */
  const generateSingleRoundRobin = (playersArr) => {
    const matches = [];
    for (let i = 0; i < playersArr.length; i++) {
      for (let j = i + 1; j < playersArr.length; j++) {
        matches.push({
          id: `${i}-${j}-single`,
          homePlayer: playersArr[i],
          awayPlayer: playersArr[j],
          homeScore: null,
          awayScore: null,
        });
      }
    }
    return matches;
  };

  /**
   * Generar Round-Robin ida y vuelta ("Doble"):
   * Por cada par [i, j], se crean 2 partidos:
   *   - ida:   home = i, away = j
   *   - vuelta: home = j, away = i
   */
  const generateDoubleRoundRobin = (playersArr) => {
    const matches = [];
    for (let i = 0; i < playersArr.length; i++) {
      for (let j = i + 1; j < playersArr.length; j++) {
        // Ida
        matches.push({
          id: `${i}-${j}-ida`,
          homePlayer: playersArr[i],
          awayPlayer: playersArr[j],
          homeScore: null,
          awayScore: null,
        });
        // Vuelta
        matches.push({
          id: `${i}-${j}-vuelta`,
          homePlayer: playersArr[j],
          awayPlayer: playersArr[i],
          homeScore: null,
          awayScore: null,
        });
      }
    }
    return matches;
  };

  // Generar los partidos según el modo seleccionado (single o double)
  const handleGenerateMatches = () => {
    if (players.length < 2) {
      alert('Se necesitan al menos 2 jugadores para generar partidos.');
      return;
    }

    let generatedMatches = [];
    if (champMode === 'double') {
      generatedMatches = generateDoubleRoundRobin(players);
    } else {
      generatedMatches = generateSingleRoundRobin(players);
    }

    localStorage.setItem('fifa25-matches', JSON.stringify(generatedMatches));
    alert(
      `Partidos generados en modo: ${
        champMode === 'double' ? 'Ida y Vuelta' : 'Normal'
      }`
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Administración de Jugadores</h1>

      {/* FORMULARIO PARA AÑADIR JUGADORES (ahora con URL de imagen) */}
      <form onSubmit={handleAddPlayer} className={styles.form}>
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="URL de la imagen (ej: https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button type="submit" className="btn primary">
          Agregar
        </button>
      </form>

      <h2>Lista de Jugadores</h2>
      <div className={styles.playerList}>
        {players.map((player, index) => (
          <div key={index} className={styles.playerCard}>
            <img
              src={player.imageUrl}
              alt={player.name}
              className={styles.playerImg}
            />
            <p>
              <strong>{player.name}</strong>
            </p>
            <button
              onClick={() => handleRemovePlayer(index)}
              className="btn secondary"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* SELECCIÓN DE MODO DE CAMPEONATO */}
      <div className={styles.modeContainer}>
        <label className={styles.modeLabel}>Modo de Campeonato:</label>
        <select
          value={champMode}
          onChange={(e) => setChampMode(e.target.value)}
          className={styles.modeSelect}
        >
          <option value="single">Normal (Una vuelta)</option>
          <option value="double">Ida y Vuelta</option>
        </select>
      </div>

      <button
        onClick={handleGenerateMatches}
        className="btn primary"
        style={{ marginTop: '1rem' }}
      >
        Generar Partidos
      </button>

      <nav style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn secondary">
          Volver al inicio
        </Link>
      </nav>
    </div>
  );
}
