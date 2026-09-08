import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * React Router v6+ dropped the `history` prop in favour of hooks. This hands
 * the equivalents to the class components that still expect props.
 */
export function withRouter(WrappedComponent) {
  function WithRouter(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    return <WrappedComponent {...props} navigate={navigate} location={location} params={params} />;
  }

  WithRouter.displayName = `withRouter(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithRouter;
}
