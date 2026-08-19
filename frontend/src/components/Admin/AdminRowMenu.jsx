import { MoreHorizontal } from 'lucide-react';

function AdminRowMenu({ menuId, openMenu, setOpenMenu, label = 'More actions', items }) {
  const open = openMenu === menuId;
  return (
    <div className="relative inline-flex justify-end" data-admin-menu>
      <button
        type="button"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-copper/25 text-copper hover:border-accretion hover:text-accretion"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu(open ? null : menuId);
        }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[210px] border border-accretion/25 bg-black p-1.5" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={`flex min-h-[38px] w-full cursor-pointer items-center gap-2.5 px-2.5 text-left text-xs tracking-wide disabled:cursor-not-allowed disabled:opacity-40 ${
                item.danger
                  ? 'text-red-300 hover:bg-red-500/15'
                  : 'text-starlight hover:bg-accretion/10 hover:text-accretion'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (item.disabled) return;
                setOpenMenu(null);
                item.onClick();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default AdminRowMenu;
