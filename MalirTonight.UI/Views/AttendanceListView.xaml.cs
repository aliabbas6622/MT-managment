using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class AttendanceListView : System.Windows.Controls.UserControl
{
    public AttendanceListView()
    {
        InitializeComponent();
    }

    public AttendanceListView(AttendanceListViewModel viewModel) : this()
    {
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadCommand.ExecuteAsync(null);
    }
}