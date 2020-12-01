import React, { useState, useEffect } from "react";
import {
  Route,
  Switch,
  Redirect,
  useHistory,
  useLocation,
} from "react-router-dom";
// import { useHistory, useLocation } from "react-router";
import AppHeader from "../common/AppHeader";
import Home from "../home/Home";
import Login from "../user/login/Login";
import Signup from "../user/signup/Signup";
import Profile from "../user/profile/Profile";
import OAuth2RedirectHandler from "../user/oauth2/OAuth2RedirectHandler";
import NotFound from "../common/NotFound";
import LoadingIndicator from "../common/LoadingIndicator";
import { getCurrentUser, getAdmin } from "../util/APIUtils";
import { ACCESS_TOKEN, ADMIN_TOKEN } from "../constants";
import PrivateRoute from "../common/PrivateRoute";
import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";
import "./App.css";
import Main from "../main/Main";
import FreshGallery from "../fresh/FreshGallery";
import Gallery from "../regular/Gallery";
import GraduateGallery from "../graduate/GraduateGallery";
import GuestBook from "../guestbook/GuestBook";
import { Grid } from "@material-ui/core";
import GraduateContent from "../graduate/GraduateContent";
import AdminRouter from "../admin/AdminRouter";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCurrentlyLoggedInUser = async () => {
    setLoading(true);
    try {
      setCurrentUser(await getCurrentUser());
      setLoading(false);
      setAuthenticated(true);
      console.log("왜 안되는거냐");
    } catch (err) {
      try {
        await getAdmin();
        setLoading(false);
        setIsAdmin(true);
        setAuthenticated(true);
        console.log("넌 관리자냐?");
      } catch (err) {
        setLoading(false);
        console.log(err && err.message);
      }
    }
  };
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    Alert.success("로그아웃 되었습니다.");
  };
  const adminLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.setItem(ADMIN_TOKEN, false);
    setAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    Alert.success("로그아웃 되었습니다.");
  };

  const query = useHistory();
  const pLoaction = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(pLoaction.search);

    if (queryParams.has("token")) {
      queryParams.delete("token");
      query.replace({
        search: queryParams.toString(),
      });
    }
    console.log(queryParams);
  }, []);

  useEffect(() => {
    loadCurrentlyLoggedInUser();
    console.log(localStorage.getItem(ADMIN_TOKEN));
    console.log(authenticated + `관리자? ${isAdmin}`);
  }, [authenticated]);

  if (loading) {
    return <LoadingIndicator />;
  } else {
    return (
      <div className="app">
        <Route
          render={({ location }) => {
            return (
              <div
                className="app-top-box"
                style={location.pathname === "/" ? { display: "none" } : {}}
              >
                <AppHeader
                  authenticated={authenticated}
                  path={location.pathname}
                  onLogout={handleLogout}
                  onAdminLogout={adminLogout}
                />
              </div>
            );
          }}
        />
        <Grid container className="app-body">
          <Grid container item xs={12} className="app-content">
            <Switch>
              <Route exact path="/" component={Main}></Route>
              <PrivateRoute
                path="/profile"
                authenticated={authenticated}
                currentUser={currentUser}
                component={Profile}
              ></PrivateRoute>
              <Route path="/home" component={Home}></Route>
              <Route
                path="/login"
                render={(props) => (
                  <Login authenticated={authenticated} {...props} />
                )}
              ></Route>
              <Redirect path="/logout" to="/" />
              <Redirect path="/admin/signOut" to="/" />
              <Route
                path="/admin"
                render={({ location }) => (
                  <AdminRouter isAdmin={isAdmin} location={location} />
                )}
              />
              <Route
                path="/signup"
                render={(props) => (
                  <Signup authenticated={authenticated} {...props} />
                )}
              ></Route>
              <Route path="/gallery" render={() => <Gallery />} />
              <Route
                path="/graduate/:student"
                component={GraduateContent}
              ></Route>
              <Route
                path="/guestbook"
                render={() => <GuestBook auth={authenticated} />}
              />
              <Route
                path="/oauth2/redirect"
                component={OAuth2RedirectHandler}
              ></Route>
              <Route component={NotFound}></Route>
            </Switch>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
