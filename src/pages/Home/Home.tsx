import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"

// Context
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../services/events/events.service";

import type { eventType } from "../../services/events/events.types";

const Home = () => {

  const { user } = useAuth();
  // const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const [events, setEvents] = useState<eventType[] | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await getEvents(user.id);
      
      if (res.status == 'success') {
        console.log(res)
        setEvents(res.events_data)
      }
    }

    fetchEvents();
    
  }, [user.id])

  return (
    <div>
      <h1 className="mb-6">Olá, {user.nome}!</h1>

      <div>
        <h2 className="font-bold mb-6 text-2xl">MEUS EVENTOS</h2>

        <div className="events">

          {events
            ?
              events.map(e => (
                <div className="event bg-[#F1F1F1] rounded-1xl shadow-md mb-4 p-[2em]" key={e.id}>
                    <h3>{e.nome} - {e.data_evento}</h3>
                </div>
              ))
            :
            (<p>Carregando eventos...</p>)
          }

        </div>
      </div>
    </div>
  )
}

export default Home