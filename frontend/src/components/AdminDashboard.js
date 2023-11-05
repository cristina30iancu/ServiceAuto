import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [vehicles, setCars] = useState([]);
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState({});
    const [monthlyProfits, setMonthlyProfits] = useState({});

    useEffect(() => {
        loadUsers();
        fetchCars();
        fetchServices();
        fetchAppointments();
        fetchMonthlyProfits();
    }, []);

    const loadUsers = async () => {
        const res = await fetch('http://localhost:8080/users');
        const data = await res.json();
        if (data.length === 0) toast.error(`Nu sunt utilizatori!`);
        else {
            setUsers(data);
        }
    };

    const fetchServices = async () => {
        const res = await fetch('http://localhost:8080/services');
        const data = await res.json();
        if (data.length === 0) toast.error(`Nu există servicii!`);
        else {
            setServices(data);
            fetchUser();
        }
    };

    const fetchCars = async () => {
        const res = await fetch('http://localhost:8080/vehicles');
        const data = await res.json();
        if (data.length === 0) toast.error(`Nu aveți mașini!`);
        else {
            setCars(data);
        }
    };

    const fetchAppointments = async () => {
        const res = await fetch('http://localhost:8080/appointments')
        const data = await res.json();
        if (data.length === 0) toast.error(`Nu aveți programări!`);
        else {
            setAppointments(data);
        }
    };

    const fetchMonthlyProfits = async () => {
        const res = await fetch('http://localhost:8080/appointments/profit')
        const data = await res.json();
        if (data.length === 0) toast.error(`Nu aveți programări!`);
        else {
            setMonthlyProfits(data);
        }
    };

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:8080/users/logged/' + token);
        const data = await res.json();
        if (!data.UserID) toast.error(`Autentificare expirată!`);
        else {
            setUser(data);
            if (data.Role === 'admin') setIsAdmin(true);
            fetchCars(data.UserID);
            fetchAppointments(data.UserID, data.Role === 'admin');
        }
    };

    const calculateMonthlyAppointments = () => {
        const monthlyAppointments = {};

        // Group appointments by month
        appointments.forEach(appointment => {
            const monthYear = appointment.Date.substring(0, 7); // Extract YYYY-MM from the date
            if (monthlyAppointments[monthYear]) {
                monthlyAppointments[monthYear] += 1;
            } else {
                monthlyAppointments[monthYear] = 1;
            }
        });

        const months = Object.keys(monthlyAppointments);
        const averages = Object.values(monthlyAppointments).map(
            appointmentsCount => appointmentsCount
        );
        return { months, averages };
    };

    // Calculate total profit of services
    const calculateTotalProfit = () => {
        let totalProfit = 0;
        services.forEach(service => {
            totalProfit += service.Price;
        });
        return totalProfit.toFixed(2);
    };

    // Calculate amount of users
    const calculateUserCount = () => {
        return users.length;
    };

    const monthlyAverageAppointmentsData = calculateMonthlyAppointments();
    const totalProfit = calculateTotalProfit();
    const userCount = calculateUserCount();

    const barChartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Număr Mediu de Programări',
                    color: 'black',
                },
                grid: {
                    color: 'black',
                },
                ticks: {
                    color: 'black',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Lună',
                    color: 'black',
                },
                grid: {
                    color: 'black',
                },
                ticks: {
                    color: 'black',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: 'black',
                },
            },
        },
    };

    const generateCSVReport = () => {
        // Crează un șir de caractere pentru antetul raportului
        let csv = 'Luna,Toate Programarile,Programari Platite,Programari Acceptate,Programari in Asteptare,Programari Anulate,Profit,Profit Mediu per Programare (Platite sau Acceptate)\n';

        // Parcurge datele pentru fiecare lună din graficele existente
        for (let i = 0; i < monthlyAverageAppointmentsData.months.length; i++) {
            const month = monthlyAverageAppointmentsData.months[i];
            const appointmentsCount = monthlyAverageAppointmentsData.averages[i];
            const paidAppointments = appointments.filter(appointment => appointment.Date.substring(0, 7) === month && appointment.Status === 'Plătită').length;
            const acceptedAppointments = appointments.filter(appointment => appointment.Date.substring(0, 7) === month && appointment.Status === 'Acceptată').length;
            const pendingAppointments = appointments.filter(appointment => appointment.Date.substring(0, 7) === month && appointment.Status === 'În așteptare').length;
            const canceledAppointments = appointments.filter(appointment => appointment.Date.substring(0, 7) === month && appointment.Status === 'Anulată').length;
            const profit = monthlyProfits[month];
            const averageProfitPerAppointment = profit / (paidAppointments + acceptedAppointments);

            // Adaugă valorile în șirul CSV
            csv += `${month},${appointmentsCount},${paidAppointments},${acceptedAppointments},${pendingAppointments},${canceledAppointments},${profit},${averageProfitPerAppointment}\n`;
        }

        // Generează fișierul CSV și descarcă-l
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'raport.csv';
        link.click();
    };


    return (
        <div className="container justify-content-center">
            <h1 className="mt-4 mb-4 text-center text-light">Panou de Administrare</h1>
            <div className='row justify-content-center'>
             <button className='btn btn-secondary my-3 w-25' onClick={generateCSVReport}>Descarcă raport CSV</button>
               </div>
            <div className='row'>
                <div className="col-md-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="card-title text-center text-light">Număr Mediu de Programări Lunare</h2>
                            <Bar
                                data={{
                                    labels: monthlyAverageAppointmentsData.months,
                                    datasets: [
                                        {
                                            label: 'Număr Mediu de Programări',
                                            data: monthlyAverageAppointmentsData.averages,
                                            backgroundColor: 'rgba(75,192,192,0.6)',
                                        },
                                    ],
                                }}
                                options={barChartOptions}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="card-title text-center text-light">Profit Lunar</h2>
                            <Bar
                                data={{
                                    labels: Object.keys(monthlyProfits),
                                    datasets: [
                                        {
                                            label: 'Profit Lunar',
                                            data: Object.values(monthlyProfits),
                                            backgroundColor: 'rgba(192,75,75,0.6)',
                                        },
                                    ],
                                }}
                                options={barChartOptions}
                            />
                        </div>
                    </div>
                </div>

            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <h2 className="card-title">Profit Total al Serviciilor</h2>
                            <h3 className="card-text">${totalProfit}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <h2 className="card-title">Număr de Utilizatori</h2>
                            <h3 className="card-text">{userCount}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default AdminDashboard;