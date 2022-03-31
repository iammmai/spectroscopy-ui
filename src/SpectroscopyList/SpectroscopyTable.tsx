import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";

import { useQueries, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import api from "api";
import { CircularProgress } from "@mui/material";

const SpectroscopyTable = ({ className }: { className: string }) => {
  const { isLoading, error, data } = useQuery("spectroscopyList", async () => {
    const { data } = await api.get("/spectroscopy/list");
    return data;
  });

  let navigate = useNavigate();
  const handleCellClick = (params: GridCellParams) => {
    navigate(`/${params.id}`);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", width: 230 },
    { field: "description", headerName: "Description", width: 230 },
    {
      field: "createdAt",
      headerName: "Created at",
      type: "date",
      width: 230,
    },
    {
      field: "updatedAt",
      headerName: "Updated at",
      type: "date",
      width: 260,
    },
  ];

  const getRowId = (row: any) => {
    return row._id;
  };

  return (
    <DataGrid
      rows={data}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[5]}
      getRowId={getRowId}
      className={className}
      onCellClick={handleCellClick}
      autoHeight
    />
  );
};

export default SpectroscopyTable;
