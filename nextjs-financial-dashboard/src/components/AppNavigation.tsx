"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const navItems = [
  { name: 'Gastos', href: '/dashboard/gastos' },
  { name: 'Ingresos', href: '/dashboard/ingresos' },
  { name: 'Flujo de Caja', href: '/dashboard/flujo-caja' },
  { name: 'Gráfico', href: '/dashboard/grafico' },
  { name: 'Registro Pagos', href: '/dashboard/registro-pagos' },
  { name: 'Recordatorios', href: '/dashboard/recordatorios' },
  { name: 'Presupuestos', href: '/dashboard/presupuestos' },
  { name: 'Baby Steps', href: '/dashboard/baby-steps' },
  { name: 'Ajustes', href: '/dashboard/ajustes' },
  { name: 'Log', href: '/dashboard/log' },
];

const AppNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap justify-start mb-4 border-b-2 border-gray-300">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href === '/dashboard/gastos' && pathname === '/dashboard');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`px-4 py-2 cursor-pointer text-sm font-medium whitespace-nowrap
                        border-b-3 transition-colors duration-300 ease-in-out
                        ${
                          isActive
                            ? 'text-primary border-primary font-semibold' // Tailwind 'primary' color defined in config
                            : 'text-gray-500 border-transparent hover:text-primary hover:border-primary'
                        }
                        focus:outline-none focus:text-primary focus:border-primary`} // Focus style
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default AppNavigation;
