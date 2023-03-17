import { useNavigate } from 'react-router-dom'

const NoFoundPage = () => {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/')}>Back Home</button>
}

export default NoFoundPage
