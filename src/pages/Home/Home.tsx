import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"

// Context
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../services/events/events.service";

import type { eventType } from "../../services/events/events.types";

// Utils
import { formatDBDate } from "../../utils/date.utils";

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-2xl">MEUS EVENTOS</h2>
          <button className="btn btn--filled-mid-green">CRIAR EVENTO</button>
        </div>


        <div className="events">

          {events
            ?
            events.map(e => (
              <div className="event bg-[#F1F1F1] rounded-1xl shadow-md mb-4 p-[2em] flex justify-between" key={e.id}>
                <div>
                  <h3 className="font-bold text-[20px]">{e.nome} - {formatDBDate(e.data_evento)}</h3>
                </div>
                <div>
                  <button className="btn btn--filled-mid-green">VER EVENTO</button>
                </div>
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