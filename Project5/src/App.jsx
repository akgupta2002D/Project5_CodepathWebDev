import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [artData, setArtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banList, setBanList] = useState([]);

  const API_key = "be9a6e2a-b3de-4b41-b1d2-f734b54f2c10";

  const fetchArtData = async (attempt = 1) => {
    try {
      setLoading(true);
      const page = Math.floor(Math.random() * 1000);
      const response = await fetch(
        `https://api.harvardartmuseums.org/object?apikey=${API_key}&hasimage=1&size=10&page=${page}&fields=objectnumber,title,dated,primaryimageurl`
      );
      const data = await response.json();

      const validRecords = data.records.filter(
        (record) =>
          record.primaryimageurl &&
          !banList.includes(record.title)
      );

      if (validRecords.length === 0) {
        fetchArtData(attempt + 1);
      } else {
        const randomArt = validRecords[Math.floor(Math.random() * validRecords.length)];
        setArtData(randomArt);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleBanClick = (title) => {
    if (!banList.includes(title)) {
      setBanList([...banList, title]);
    }
  };

  const handleUnbanClick = (title) => {
    setBanList(banList.filter((item) => item !== title));
  };

  useEffect(() => {
    fetchArtData();
  }, []);

  return (
    <div className="app-wrapper">
      <div className="main-content">
        <h1 className="header">🖼️ Harvard Art Explorer</h1>

        {loading ? (
          <p className="loading">Loading new artwork...</p>
        ) : artData ? (
          <div className="card">
            <h3 className="title clickable" onClick={() => handleBanClick(artData.title)}>
              {artData.title}
            </h3>
            <p><strong>Dated:</strong> {artData.dated}</p>
            <p><strong>Object #:</strong> {artData.objectnumber}</p>
            <img
              src={artData.primaryimageurl}
              alt={artData.title}
              className="image"
            />
          </div>
        ) : (
          <p>No artwork found. Try again!</p>
        )}

        <button onClick={fetchArtData} className="button">
          Discover Another Artwork
        </button>
      </div>

      <div className="banlist">
        <h4>🚫 Ban List</h4>
        {banList.length === 0 ? (
          <p className="ban-empty">No items banned yet.</p>
        ) : (
          banList.map((item, index) => (
            <p
              key={index}
              className="banItem"
              onClick={() => handleUnbanClick(item)}
              title="Click to remove from ban list"
            >
              {item}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
