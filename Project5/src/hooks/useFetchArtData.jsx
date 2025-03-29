import { useState, useEffect } from 'react';

// Replace with your Harvard Art Museums API key.
const API_KEY = 'YOUR_API_KEY';
const API_URL = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&hasimage=1&size=5`;

function useFetchArtData(banList, refresh) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        const json = await response.json();

        if (!json.records || json.records.length === 0) {
          setError('No artworks found.');
          setData(null);
          return;
        }

        // Filter out artworks without a valid image URL and banned classifications.
        const filtered = json.records.filter(record => {
          // Check for primaryimageurl or a valid image in the images array
          const hasValidImage = record.primaryimageurl || (record.images && record.images.length > 0 && record.images[0].baseimageurl);
          if (!hasValidImage) {
            return false;
          }
          if (record.classification) {
            return !banList.includes(record.classification);
          }
          return true;
        });

        if (filtered.length === 0) {
          setError('No artworks available due to ban filters.');
          setData(null);
        } else {
          // Randomly select one valid artwork.
          const randomIndex = Math.floor(Math.random() * filtered.length);
          setData(filtered[randomIndex]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Cleanup: abort the fetch if the effect re-runs or the component unmounts.
    return () => controller.abort();
  }, [banList, refresh]);

  return { data, loading, error };
}

export default useFetchArtData;
