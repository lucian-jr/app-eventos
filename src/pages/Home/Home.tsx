import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom"
import { Edit, Visibility } from "@mui/icons-material";

// Context
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../services/events/events.service";

import type { EventType } from "../../services/events/events.types";

// Utils
import { formatEventDateRange } from "../../utils/date.utils";

const Home = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const [events, setEvents] = useState<EventType[] | null>(null)

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
          <h2 className="font-bold text-[20px]">MEUS EVENTOS</h2>
          <button className="btn btn--filled-mid-green" onClick={() => navigate('/create-event')}>CRIAR EVENTO</button>
        </div>


        <div className="events">

          {events
            ?
            events.map(e => (
              <div className="event bg-[#F1F1F1] rounded-xl shadow-md mb-4 px-6 py-4 flex justify-between items-center gap-4" key={e.id}>
                <div>
                  <h3 className="font-bold text-[20px] mb-3">{e.nome} - {formatEventDateRange(e.data_evento, e.data_fim)}</h3>
                    {e.products.length ? e.products.map((product, idx) => (
                      <p className="text-[14px]" key={idx}>{product.name}</p>
                    )) 
                    : 
                    <p className="text-[14px]">Sem produtos registrados</p>
                  }
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    title="Editar evento"
                    aria-label="Editar evento"
                    className="w-9 h-9 rounded-lg bg-[#41C982] text-white flex items-center justify-center hover:opacity-80 transition-opacity shadow-sm cursor-pointer"
                    onClick={() => navigate(`/edit-event/${e.id}`)}
                  >
                    <Edit fontSize="small" />
                  </button>
                  <button
                    type="button"
                    title="Ver evento"
                    aria-label="Ver evento"
                    className="w-9 h-9 rounded-lg bg-[#027B8B] text-white flex items-center justify-center hover:opacity-80 transition-opacity shadow-sm cursor-pointer"
                    onClick={() => navigate(`/dashboard/${e.id}`)}
                  >
                    <Visibility fontSize="small" />
                  </button>
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